import { updateSudo } from '@lblod/mu-auth-sudo';
import { sparqlEscapeUri } from 'mu';
import { CASE_FIELD_PREDICATE, SUBCASE_FIELD_PREDICATE } from '../config';

async function syncFieldsForCaseInGraph (caseUri, graph) {
  // Delete all fields on case
  const deleteString = `
PREFIX dossier: <https://data.vlaanderen.be/ns/dossier#>
DELETE {
    GRAPH ${sparqlEscapeUri(graph)} {
        ${sparqlEscapeUri(caseUri)} ${sparqlEscapeUri(CASE_FIELD_PREDICATE)} ?anyField .
    }
}
WHERE {
    GRAPH ${sparqlEscapeUri(graph)} {
        ${sparqlEscapeUri(caseUri)} a dossier:Dossier .
        ${sparqlEscapeUri(caseUri)} ${sparqlEscapeUri(CASE_FIELD_PREDICATE)} ?anyField .
    }
}
  `;

  // Insert all fields on case
  const insertString = `
PREFIX dossier: <https://data.vlaanderen.be/ns/dossier#>
INSERT {
    GRAPH ${sparqlEscapeUri(graph)} {
        ${sparqlEscapeUri(caseUri)} ${sparqlEscapeUri(CASE_FIELD_PREDICATE)} ?field .
    }
}
WHERE {
    GRAPH ${sparqlEscapeUri(graph)} {
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
