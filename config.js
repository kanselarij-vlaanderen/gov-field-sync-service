const GRAPH = 'http://mu.semte.ch/graphs/organizations/kanselarij';

const CASE_TYPE = 'https://data.vlaanderen.be/ns/dossier#Dossier';
const SUBCASE_TYPE = 'https://data.vlaanderen.be/ns/dossier#Procedurestap';
const CASE_FIELD_PREDICATE = 'http://data.vlaanderen.be/ns/besluitvorming#beleidsveld';
// relation is the same for for case and subcase, officially it does not exist on OSLO for subcase
const SUBCASE_FIELD_PREDICATE = 'http://data.vlaanderen.be/ns/besluitvorming#beleidsveld';

module.exports = {
  GRAPH,
  CASE_TYPE,
  SUBCASE_TYPE,
  CASE_FIELD_PREDICATE,
  SUBCASE_FIELD_PREDICATE,
};
