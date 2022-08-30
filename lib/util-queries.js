import { querySudo } from '@lblod/mu-auth-sudo';
import { sparqlEscapeUri } from 'mu';

import { parseSparqlResults } from './query-util';

const GRAPH = 'http://mu.semte.ch/graphs/organizations/kanselarij';

async function subjectIsTypeInGraph (subject) {
  const queryString = `
SELECT DISTINCT ?type
WHERE {
    GRAPH ${sparqlEscapeUri(GRAPH)} {
        ${sparqlEscapeUri(subject)} a ?type .
    }
}
  `;
  const result = await querySudo(queryString);
  const parsedResults = parseSparqlResults(result);
  return parsedResults.length ? parsedResults[0].type : null;
}

async function caseFromSubjectUri (subjectUri) {
  const queryString = `
PREFIX dossier: <https://data.vlaanderen.be/ns/dossier#>

SELECT DISTINCT ?case
WHERE {
    GRAPH ${sparqlEscapeUri(GRAPH)} {
        ${sparqlEscapeUri(subjectUri)} a dossier:Procedurestap .
        ?case dossier:doorloopt ${sparqlEscapeUri(subjectUri)}  .
    }
}
  `;
  const result = await querySudo(queryString);
  const parsedResults = parseSparqlResults(result);
  return parsedResults.length ? parsedResults[0].case : null;
}

module.exports = {
  subjectIsTypeInGraph,
  caseFromSubjectUri,
};
