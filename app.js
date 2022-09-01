import { app, errorHandler } from 'mu';
import bodyParser from 'body-parser';

import { reduceChangesets } from './lib/delta-util';
import { decisionmakingFlowFromSubjectUri } from './lib/util-queries';
import { syncFieldsForDecisionmakingFlowInGraph } from './lib/decisionmaking-flow-field-queries';

app.post('/delta', bodyParser.json(), async (req, res) => {
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
