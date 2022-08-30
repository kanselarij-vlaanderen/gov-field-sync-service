import { updateSudo } from '@lblod/mu-auth-sudo';
import { sparqlEscapeUri } from 'mu';

const GRAPH = 'http://mu.semte.ch/graphs/organizations/kanselarij';
const CASE_FIELD_PREDICATE = 'http://data.vlaanderen.be/ns/besluitvorming#beleidsveld';
// relation is the same for for case and subcase, officially it does not exist on OSLO for subcase
const SUBCASE_FIELD_PREDICATE = 'http://data.vlaanderen.be/ns/besluitvorming#beleidsveld';

async function syncFieldsForCaseInGraph (caseUri) {
  // Delete all fields on case
  const deleteString = `
PREFIX dossier: <https://data.vlaanderen.be/ns/dossier#>
DELETE {
    GRAPH ${sparqlEscapeUri(GRAPH)} {
        ${sparqlEscapeUri(caseUri)} ${sparqlEscapeUri(CASE_FIELD_PREDICATE)} ?anyField .
    }
}
WHERE {
    GRAPH ${sparqlEscapeUri(GRAPH)} {
        ${sparqlEscapeUri(caseUri)} a dossier:Dossier .
        ${sparqlEscapeUri(caseUri)} ${sparqlEscapeUri(CASE_FIELD_PREDICATE)} ?anyField .
    }
}
  `;

  // Insert all fields on case
  const insertString = `
PREFIX dossier: <https://data.vlaanderen.be/ns/dossier#>
INSERT {
    GRAPH ${sparqlEscapeUri(GRAPH)} {
        ${sparqlEscapeUri(caseUri)} ${sparqlEscapeUri(CASE_FIELD_PREDICATE)} ?field .
    }
}
WHERE {
    GRAPH ${sparqlEscapeUri(GRAPH)} {
        ${sparqlEscapeUri(caseUri)} a dossier:Dossier ;
          dossier:doorloopt ?subcase .
        ?subcase ${sparqlEscapeUri(SUBCASE_FIELD_PREDICATE)} ?field .
    }
}
  `;

  await updateSudo(deleteString);
  await updateSudo(insertString);
}

module.exports = {
  syncFieldsForCaseInGraph
};
