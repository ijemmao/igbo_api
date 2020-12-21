import stringSimilarity from 'string-similarity';
import diacriticless from 'diacriticless';
import {
  assign,
  isNaN,
  orderBy,
  get,
  map,
} from 'lodash';
import removePrefix from '../../shared/utils/removePrefix';
import createRegExp from '../../shared/utils/createRegExp';
import SortingDirections from '../../shared/constants/sortingDirections';
import { findUser } from '../users';
import UserRoles from '../../shared/constants/userRoles';

const DEFAULT_RESPONSE_LIMIT = 10;
const MAX_RESPONSE_LIMIT = 25;

/* Either creates a regex pattern for provided searchWord
or fallbacks to matching every word */
export const createQueryRegex = (searchWord) => (!searchWord ? /./ : createRegExp(searchWord));

/* Determines if an empty response should be returned
 * if the request comes from an unauthed user in production
 */
const constructRegexQuery = ({ user, searchWord }) => (
  user.role && (
    user.role === UserRoles.EDITOR
    || user.role === UserRoles.MERGER
    || user.role === UserRoles.ADMIN
  )
    ? createQueryRegex(searchWord)
    : searchWord
      ? createQueryRegex(searchWord)
      : /.{0,}/
);

/* Given a list of keys, where each key's value is a list of Firebase uids,
 * replace each uid with a user object */
export const populateFirebaseUsers = async (doc, keys) => {
  const docWithPopulateFirebaseUsers = assign(doc);
  await Promise.all(map(keys, async (key) => {
    docWithPopulateFirebaseUsers[key] = await Promise.all(map(docWithPopulateFirebaseUsers[key], findUser));
  }));
  return docWithPopulateFirebaseUsers;
};

/* Sorts all the docs based on the provided searchWord */
export const sortDocsBy = (searchWord, docs, key) => (
  docs.sort((prevDoc, nextDoc) => {
    const prevDocValue = get(prevDoc, key);
    const nextDocValue = get(nextDoc, key);
    const prevDocDifference = stringSimilarity.compareTwoStrings(searchWord, diacriticless(prevDocValue)) * 100;
    const nextDocDifference = stringSimilarity.compareTwoStrings(searchWord, diacriticless(nextDocValue)) * 100;
    if (prevDocDifference === nextDocDifference) {
      return 0;
    }
    return prevDocDifference > nextDocDifference ? -1 : 1;
  })
);

/* Validates the provided range */
export const isValidRange = (range) => {
  if (!Array.isArray(range)) {
    return false;
  }

  /* Invalid range if first element is larger than the second */
  if (range[0] >= range[1]) {
    return false;
  }

  const validRange = range;
  validRange[1] += 1;
  return !(validRange[1] - validRange[0] > MAX_RESPONSE_LIMIT) && !(validRange[1] - validRange[0] < 0);
};

/* Takes both page and range and converts them into appropriate skip and limit */
export const convertToSkipAndLimit = ({ page, range }) => {
  let skip = 0;
  let limit = 10;
  if (isValidRange(range)) {
    [skip] = range;
    limit = range[1] - range[0];
    return { skip, limit };
  }

  if (isNaN(page)) {
    throw new Error('Page is not a number.');
  }
  const calculatedSkip = page * DEFAULT_RESPONSE_LIMIT;
  if (calculatedSkip < 0) {
    throw new Error('Page must be a positive number.');
  }
  return { skip: calculatedSkip, limit };
};

/* Packages the res response with sorting */
export const packageResponse = async ({
  res,
  docs,
  model,
  query,
  sort,
}) => {
  try {
    const sendDocs = sort ? orderBy(docs, [sort.key], [sort.direction]) : docs;
    const count = await model.countDocuments(query);
    res.setHeader('Content-Range', count);
    return res.send(sendDocs);
  } catch (err) {
    res.status(400);
    return res.send({ error: err.message });
  }
};

/* Converts the filter query into a word to be used as the keyword query */
const convertFilterToKeyword = (filter = '{"word": ""}') => {
  try {
    const parsedFilter = typeof filter === 'object' ? filter : JSON.parse(filter) || { word: '' };
    const firstFilterKey = Object.keys(parsedFilter)[0];
    return parsedFilter[firstFilterKey];
  } catch {
    throw new Error(`Invalid filter query syntax. Expected: {"word":"filter"}, Received: ${filter}`);
  }
};

/* Parses the ranges query to turn into an array */
const parseRange = (range) => {
  try {
    if (!range) {
      return null;
    }
    const parsedRange = typeof range === 'object' ? range : JSON.parse(range) || null;
    return parsedRange;
  } catch {
    throw new Error(`Invalid range query syntax. Expected: [x,y], Received: ${range}`);
  }
};

/* Parses out the key and the direction of sorting out into an object */
const parseSortKeys = (sort) => {
  try {
    if (sort) {
      const parsedSort = JSON.parse(sort);
      const [key] = parsedSort[0] === 'approvals' || parsedSort[0] === 'denials'
        ? [`${parsedSort[0]}.length`] : parsedSort;
      const direction = parsedSort[1].toLowerCase();
      if (direction.toLowerCase() !== SortingDirections.ASCENDING
        && direction.toLowerCase() !== SortingDirections.DESCENDING) {
        throw new Error('Invalid sorting direction. Valid sorting optons: "asc" or "desc"');
      }
      return {
        key,
        direction,
      };
    }
    return null;
  } catch {
    throw new Error(`Invalid sort query syntax. Expected: [key,direction], Received: ${sort}`);
  }
};

/* Handles all the queries for searching in the database */
export const handleQueries = ({ query = {}, user = {} }) => {
  const {
    keyword = '',
    page: pageQuery = 0,
    range: rangeQuery = '',
    sort: sortQuery,
    filter: filterQuery,
    strict: strictQuery,
  } = query;
  const filter = convertFilterToKeyword(filterQuery);
  const searchWord = removePrefix(keyword || filter || '');
  const regexKeyword = constructRegexQuery({ user, searchWord });
  const page = parseInt(pageQuery, 10);
  const range = parseRange(rangeQuery);
  const { skip, limit } = convertToSkipAndLimit({ page, range });
  const sort = parseSortKeys(sortQuery);
  const strict = strictQuery === 'true';
  return {
    searchWord,
    regexKeyword,
    page,
    sort,
    skip,
    limit,
    strict,
  };
};

/* Updates a document's merge property with a document id */
export const updateDocumentMerge = (suggestionDoc, originalDocId, mergedBy = null) => {
  const updatedSuggestion = assign(suggestionDoc, { merged: originalDocId, mergedBy });
  return updatedSuggestion.save();
};
