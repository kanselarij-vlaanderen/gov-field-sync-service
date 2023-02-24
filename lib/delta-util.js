function reduceChangesets(delta) {
  const uriSet = new Set();
  for (let changeset of delta) {
    const triples = [...changeset.inserts, ...changeset.deletes];
    const filteredTriples = triples.filter(t => t.predicate.value === 'https://data.vlaanderen.be/ns/besluitvorming#beleidsveld');
    const subjects = filteredTriples.map(t => t.subject.value);
    [...subjects].forEach(uri => uriSet.add(uri));
  }

  return [...uriSet];
}

export {
  reduceChangesets,
};
