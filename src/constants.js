export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;

const CLASSIFICATION_CONSTANTS = [
  'IN_PROGRESS',
  'NOT_IN_WORD',
  'IN_WORD_WRONG_PLACE',
  'IN_WORD_RIGHT_PLACE',
];

export const RANKED_CLASSIFICATIONS = CLASSIFICATION_CONSTANTS.
  reduce((acc, el, idx) => ({ ...acc, [el]: idx }), {});

export const CLASSIFICATIONS = CLASSIFICATION_CONSTANTS.
  reduce((acc, el) => ({ ...acc, [el]: el }), {});

export const BLANK_RECORD = {
  A: null,
  B: null,
  C: null,
  D: null,
  E: null,
  F: null,
  G: null,
  H: null,
  I: null,
  J: null,
  K: null,
  L: null,
  M: null,
  N: null,
  O: null,
  P: null,
  Q: null,
  R: null,
  S: null,
  T: null,
  U: null,
  V: null,
  W: null,
  X: null,
  Y: null,
  Z: null,
};
