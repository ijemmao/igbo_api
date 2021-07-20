import mongoose from 'mongoose';
import { every, has, partial } from 'lodash';
import {
  normalizeWordHook,
  toJSONPlugin,
  toObjectPlugin,
  updatedOnHook,
} from './plugins';
import Dialects from '../shared/constants/Dialects';

const REQUIRED_DIALECT_KEYS = ['word', 'variations', 'accented', 'dialect', 'pronunciation'];
const REQUIRED_DIALECT_CONSTANT_KEYS = ['code', 'value', 'label'];

const { Schema } = mongoose;
const wordSchema = new Schema({
  word: { type: String, required: true },
  wordClass: { type: String, default: '' },
  definitions: { type: [{ type: String }], default: [] },
  dialects: {
    type: Object,
    validate: (v) => {
      const dialectValues = Object.values(v);
      return dialectValues.every((dialectValue) => (
        every(REQUIRED_DIALECT_KEYS, partial(has, dialectValue))
        && every(REQUIRED_DIALECT_CONSTANT_KEYS, partial(has, Dialects[dialectValue.dialect]))
        && dialectValue.dialect === Dialects[dialectValue.dialect].value
      ));
    },
  },
  pronunciation: { type: String, default: '' },
  isStandardIgbo: { type: Boolean, default: false },
  variations: { type: [{ type: String }], default: [] },
  frequency: { type: Number },
  stems: { type: [{ type: String }], default: [] },
  accented: { type: String, default: '' },
  updatedOn: { type: Date, default: Date.now() },
}, { toObject: toObjectPlugin });

/* Create text indexes for each dialect word field */
const dialectsIndexFields = Object.keys(Dialects)
  .reduce((indexFields, key) => (
    { ...indexFields, [`dialects.${key}.word`]: 'text' }
  ), {});

wordSchema.index({ word: 'text', variations: 'text', ...dialectsIndexFields });

toJSONPlugin(wordSchema);
updatedOnHook(wordSchema);
normalizeWordHook(wordSchema);

const WordModel = mongoose.model('Word', wordSchema);
WordModel.syncIndexes();

export default WordModel;
