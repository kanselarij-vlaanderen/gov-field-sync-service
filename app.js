import { app, errorHandler } from 'mu';
import bodyParser from 'body-parser';

import { reduceChangesets } from './lib/delta-util'
import { caseFromSubjectUri } from './lib/util-queries';
import { syncFieldsForCaseInGraph } from './lib/case-field-queries';
import { GRAPH } from './config';

app.post('/delta', bodyParser.json(), async (req, res) => {
  res.status(202).end();
  const deltas = req.body;
  // could be cases or subcases
  if (deltas.length) {
    console.debug(`Received deltas (${deltas.length} total)`);
  } else {
    return; // Empty delta message received on startup?
  }

  // get unique set of subject URI's from insert and delete with correct predicate (should be subcase)
  // * note, these can still contain cases unless we apply a string filter on subject
  const subjectUris = reduceChangesets(deltas);

  const caseUris = new Set();
  // get unique set of cases connected
  // for each, do the collection update
  for (const subjectUri of subjectUris) {
    const _case = await caseFromSubjectUri(subjectUri, GRAPH);
    caseUris.add(_case);
  }

  for (const caseUri of caseUris) {
    await syncFieldsForCaseInGraph(caseUri, GRAPH);
    caseUris.delete(caseUri);
  }
});

app.use(errorHandler);
