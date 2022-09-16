import { querySudo } from '@lblod/mu-auth-sudo';
import { sparqlEscapeUri } from 'mu';

import { parseSparqlResults } from './query-util';

const GRAPH = 'http://mu.semte.ch/graphs/organizations/kanselarij';

async function decisionmakingFlowFromSubjectUri (subjectUri) {
  const queryString = `
PREFIX dossier: <https://data.vlaanderen.be/ns/dossier#>

SELECT DISTINCT ?decisionmakingFlow
WHERE {
    GRAPH ${sparqlEscapeUri(GRAPH)} {
        ${sparqlEscapeUri(subjectUri)} a dossier:Procedurestap .
        ?decisionmakingFlow dossier:doorloopt ${sparqlEscapeUri(subjectUri)}  .
    }
}
  `;
  const result = await querySudo(queryString);
  const parsedResults = parseSparqlResults(result);
  return parsedResults.length ? parsedResults[0].decisionmakingFlow : null;
}

export {
  decisionmakingFlowFromSubjectUri,
}
