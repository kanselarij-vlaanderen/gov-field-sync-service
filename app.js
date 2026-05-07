import { app, errorHandler } from 'mu';
import bodyParser from 'body-parser';
import cron from 'node-cron';

import { reduceChangesets } from './lib/delta-util';
import { decisionmakingFlowFromSubjectUri } from './lib/util-queries';
import { syncFieldsForDecisionmakingFlowInGraph, syncFieldsForAllDecisionmakingFlows } from './lib/decisionmaking-flow-field-queries';

const ALLOWED_DELTA_SIZE = process.env.ALLOWED_DELTA_SIZE || '100mb';
const CRON_PATTERN = process.env.CRON_PATTERN || '0 0 * * *';

cron.schedule(CRON_PATTERN, async () => {
  try {
    console.log(`[cron] Running gov-field sync (pattern: ${CRON_PATTERN})...`);
    await syncFieldsForAllDecisionmakingFlows();
    console.log('[cron] Gov-field sync completed.');
  } catch (err) {
    console.trace(err);
  }
});

app.post('/run', async (req, res, next) => {
  try {
    console.log('Running gov-field sync...');
    await syncFieldsForAllDecisionmakingFlows();
    console.log('Gov-field sync completed.');
    return res.status(200).send({ message: 'Gov-field sync completed.' });
  } catch (err) {
    console.trace(err);
    const error = new Error(err.message || 'Something went wrong while running gov-field sync.');
    error.status = 500;
    return next(error);
  }
});

app.post('/delta', bodyParser.json({ limit: ALLOWED_DELTA_SIZE }), async (req, res) => {
  res.status(202).end();
  const deltas = req.body;
  // could be decisionmakingFlow or subcases
  if (deltas.length) {
    console.debug(`Received deltas (${deltas.length} total)`);
  } else {
    return; // Empty delta message received on startup?
  }

  // Unique set of subject URI's from insert and delete with correct predicate (should be subcase)
  // * note, these can still contain decisionmakingFlows unless we apply a string filter on subject
  const subjectUris = reduceChangesets(deltas);

  // unique set of decisionmakingFlows connected
  const decisionmakingFlowUris = new Set();

  for (const subjectUri of subjectUris) {
    const decisionmakingFlow = await decisionmakingFlowFromSubjectUri(subjectUri);
    if (decisionmakingFlow) {
      decisionmakingFlowUris.add(decisionmakingFlow);
    }
  }

  // process resource by resource, updating the collection on decisionmakingFlow
  for (const uri of decisionmakingFlowUris) {
    await syncFieldsForDecisionmakingFlowInGraph(uri);
    decisionmakingFlowUris.delete(uri);
  }
});

app.use(errorHandler);
