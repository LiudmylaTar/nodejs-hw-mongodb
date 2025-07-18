import { SORT_ORDER } from '../constants/index.js';

const parseSortBy = (sortBy) => {
  const keysOfContacts = ['_id', 'name', 'contactType', 'createdAt'];
  if (keysOfContacts.includes(sortBy) !== true) {
    return '_id';
  }

  if (typeof sortBy === 'undefined') {
    return '_id';
  }
  return sortBy;
};

const parseSortOrder = (sortOrder) => {
  if (typeof sortOrder === 'undefined') {
    return SORT_ORDER.ASC; // ascending
  }
  if (sortOrder !== SORT_ORDER.ASC && sortOrder !== SORT_ORDER.DESC) {
    return SORT_ORDER.ASC;
  }
  return sortOrder;
};

export const parseSortParams = (query) => {
  const { sortOrder, sortBy } = query;

  const parsedSortBy = parseSortBy(sortBy);
  const parsedSortOrder = parseSortOrder(sortOrder);

  return {
    sortOrder: parsedSortOrder,
    sortBy: parsedSortBy,
  };
};
