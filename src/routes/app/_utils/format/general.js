

export function FILTER_NAME_QUERY(array, query) {
  query = query.toLowerCase();
  return query.length ? array.filter(s => s.name.toLowerCase().includes(query)) : array;
}
