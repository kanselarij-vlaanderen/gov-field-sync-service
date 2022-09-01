import { updateSudo } from '@lblod/mu-auth-sudo';
import { sparqlEscapeUri } from 'mu';

const GRAPH = 'http://mu.semte.ch/graphs/organizations/kanselarij';
const DECISIONMAKING_FLOW_FIELD_PREDICATE = 'http://data.vlaanderen.be/ns/besluitvorming#beleidsveld';
// relation is the same for for decisionmakingFlow and subcase, officially it does not exist on OSLO for subcase
const SUBCASE_FIELD_PREDICATE = 'http://data.vlaanderen.be/ns/besluitvorming#beleidsveld';

async function syncFieldsForDecisionmakingFlowInGraph (decisionmakingFlowUri) {
  // Delete all fields on decisionmakingFlow
  const deleteString = `
PREFIX dossier: <https://data.vlaanderen.be/ns/dossier#>
DELETE {
    GRAPH ${sparqlEscapeUri(GRAPH)} {
        ${sparqlEscapeUri(decisionmakingFlowUri)} ${sparqlEscapeUri(DECISIONMAKING_FLOW_FIELD_PREDICATE)} ?anyField .
    }
}
WHERE {
    GRAPH ${sparqlEscapeUri(GRAPH)} {
        ${sparqlEscapeUri(decisionmakingFlowUri)} a dossier:Dossier .
        ${sparqlEscapeUri(decisionmakingFlowUri)} ${sparqlEscapeUri(DECISIONMAKING_FLOW_FIELD_PREDICATE)} ?anyField .
    }
}
  `;

  // Insert all fields on decisionmakingFlow
  const insertString = `
PREFIX dossier: <https://data.vlaanderen.be/ns/dossier#>
INSERT {
    GRAPH ${sparqlEscapeUri(GRAPH)} {
        ${sparqlEscapeUri(decisionmakingFlowUri)} ${sparqlEscapeUri(DECISIONMAKING_FLOW_FIELD_PREDICATE)} ?field .
    }
}
WHERE {
    GRAPH ${sparqlEscapeUri(GRAPH)} {
        ${sparqlEscapeUri(decisionmakingFlowUri)} a dossier:Dossier ;
          dossier:doorloopt ?subcase .
        ?subcase ${sparqlEscapeUri(SUBCASE_FIELD_PREDICATE)} ?field .
    }
}
  `;

  await updateSudo(deleteString);
  await updateSudo(insertString);
}

export {
  syncFieldsForDecisionmakingFlowInGraph,
}
