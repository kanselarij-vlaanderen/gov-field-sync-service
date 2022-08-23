import { app, errorHandler } from 'mu';
import bodyParser from 'body-parser';

import * as deltaUtil from './lib/delta-util';
import { subjectIsTypeInGraph } from './util-queries';
import { syncObjectsForSubjectInGraph, unsyncObjectsForSubjectInGraph } from './case-field-queries';
import { GRAPH, UPDATEABLE_PREDICATES, WATCH_TYPES } from './config';

app.post('/delta', bodyParser.json(), async (req, res) => {
  res.status(202).end();
  const insertionDeltas = deltaUtil.insertionDeltas(req.body);
  const deletionDeltas = deltaUtil.deletionDeltas(req.body);
  if (insertionDeltas.length || deletionDeltas.length) {
    console.debug(`Received deltas (${insertionDeltas.length + deletionDeltas.length} total)`);
  } else {
    return; // Empty delta message received on startup?
  }

  // UPDATES in group path (entities need graph-moving)
  const insertPathUpdates = deltaUtil.filterByPredicate(insertionDeltas, UPDATEABLE_PREDICATES);
  if (insertPathUpdates.length) {
    console.log(`Received insert deltas for ${insertPathUpdates.length} field-relations that need updates in their case as well.`);
  }
  for (const d of insertPathUpdates) {
    const subjectUri = d.subject.value;
    const watchedType = WATCH_TYPES.find(t => t.predicateToObject.uri === d.predicate.value);
    const subjectType = watchedType.type;
    if (await subjectIsTypeInGraph(subjectUri, GRAPH, [subjectType])) {
      await syncObjectsForSubjectInGraph(d.subject.value, subjectType, GRAPH);
    }
  }
  const deletePathUpdates = deltaUtil.filterByPredicate(deletionDeltas, UPDATEABLE_PREDICATES);

  // deletes
  if (deletePathUpdates.length) {
    console.log(`Received delete deltas for ${deletePathUpdates.length} field-relations that need updates in their case as well.`);
  }
  for (const d of deletePathUpdates) {
    const subjectUri = d.subject.value;
    const watchedType = WATCH_TYPES.find(t => t.predicateToObject.uri === d.predicate.value);
    const subjectType = watchedType.type;
    if (await subjectIsTypeInGraph(subjectUri, GRAPH, [subjectType])) {
      await unsyncObjectsForSubjectInGraph(d.subject.value, subjectType, GRAPH);
    }
  }
});

app.use(errorHandler);
