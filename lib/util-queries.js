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

// Decisionmaking flows that miss a field of one of their subcases,
// or have a field that none of their subcases has
async function outOfSyncDecisionmakingFlows () {
  const queryString = `
PREFIX dossier: <https://data.vlaanderen.be/ns/dossier#>
PREFIX besluitvorming: <https://data.vlaanderen.be/ns/besluitvorming#>

SELECT DISTINCT ?decisionmakingFlow
WHERE {
    GRAPH ${sparqlEscapeUri(GRAPH)} {
        ?decisionmakingFlow a besluitvorming:Besluitvormingsaangelegenheid .
        {
            ?decisionmakingFlow dossier:doorloopt ?subcase .
            ?subcase besluitvorming:beleidsveld ?field .
            FILTER NOT EXISTS { ?decisionmakingFlow besluitvorming:beleidsveld ?field }
        } UNION {
            ?decisionmakingFlow besluitvorming:beleidsveld ?field .
            FILTER NOT EXISTS {
                ?decisionmakingFlow dossier:doorloopt ?otherSubcase .
                ?otherSubcase besluitvorming:beleidsveld ?field .
            }
        }
    }
}
  `;
  const result = await querySudo(queryString);
  return parseSparqlResults(result).map((r) => r.decisionmakingFlow);
}

export {
  decisionmakingFlowFromSubjectUri,
  outOfSyncDecisionmakingFlows,
}
