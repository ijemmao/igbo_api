import mongoose from 'mongoose';

export const LOCAL_ROUTE = '/';
export const API_ROUTE = '/api/v1';
export const TEST_ROUTE = '/api/v1/test';
export const API_URL = 'https://igboapi.com';

export const SAVE_DOC_DELAY = 2000;

export const WORD_KEYS = [
  'accented',
  'variations',
  'definitions',
  'stems',
  'id',
  'word',
  'wordClass',
  'pronunciation',
  'isStandardIgbo',
  'updatedOn',
];
export const EXAMPLE_KEYS = ['accented', 'igbo', 'english', 'associatedWords', 'id', 'updatedOn'];
export const DIALECT_KEYS = [
  'NSA',
  'UMU',
  'ANI',
  'OKA',
  'AFI',
  'MBA',
  'EGB',
  'OHU',
  'ORL',
  'NGW',
  'OWE',
  'NSU',
  'BON',
  'OGU',
  'ONI',
  'ECH',
  'UNW',
];
export const EXCLUDE_KEYS = ['__v', '_id'];
export const SITE_TITLE = 'The First African Language API';
export const DOCS_SITE_TITLE = 'Igbo API Documentation';
export const INVALID_ID = 'fdsafdsad';
export const NONEXISTENT_ID = new mongoose.Types.ObjectId();
export const MAIN_KEY = 'main_key';
export const FALLBACK_API_KEY = 'fallback_api_key';
