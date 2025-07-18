function parseNumber(value, defaultValue) {
  if (typeof value === 'undefined') {
    return defaultValue;
  }
  const parsedValued = parseInt(value);
  if (Number.isNaN(parsedValued === true)) {
    return defaultValue;
  }
  return parsedValued;
}

export function parsePaginationParams(query) {
  const { page, perPage } = query;

  const parsedPage = parseNumber(page, 1);
  const parsedPerPage = parseNumber(perPage, 8);
  return {
    page: parsedPage,
    perPage: parsedPerPage,
  };
}
