function reduceChangesets(delta) {
  const uriSet = new Set();
  for (let changeset of delta) {
    const triples = [...changeset.inserts, ...changeset.deletes];
    const subjects = triples.map(t => t.subject.value);
    [...subjects].forEach(uri => uriSet.add(uri));
  }

  return [...uriSet];
}

export {
  reduceChangesets,
};
