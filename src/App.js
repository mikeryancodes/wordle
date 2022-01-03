import logo from './logo.svg';
import './App.css';
import { useState, useEffect, useCallback } from 'react';
import { words } from './words';

import {
  WORD_LENGTH,
  MAX_GUESSES,
  CLASSIFICATIONS,
  RANKED_CLASSIFICATIONS,
  BLANK_RECORD,
} from './constants';

function App() {
  const [record, setRecord] = useState({});
  const [secretWord, setSecretWord] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [notInList, setNotInList] = useState(false);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);

  const reinitialize = useCallback(() => {
    setRecord(BLANK_RECORD);
    setGuesses([]);
    setCurrentGuess('');
    const idx = Math.floor(Math.random() * words.length);
    const secretWord = words[idx];
    setSecretWord(secretWord);
    setNotInList(false);
    setWon(false);
    setLost(false);
  });

  useEffect(() => reinitialize(), []);

  useEffect(() => {
    if (!notInList) return;
    alert('Not in list');
    setNotInList(false);
    setCurrentGuess('');
  }, [notInList]);

  useEffect(() => {
    if (!won) return;
    alert('Nicely done!');
    reinitialize();
  }, [won]);

  useEffect(() => {
    if (!lost) return;
    alert(`Sorry, the word was ${secretWord}.`);
    reinitialize();
  }, [lost]);

  const makeGuess = useCallback(() => {
    if (currentGuess.length !== 5) return;
    if (!words.includes(currentGuess)) return setNotInList(true);
    const scoredGuess = score(secretWord, currentGuess);
    setRecord(getUpdatedRecord(record, scoredGuess));
    setGuesses([...guesses, scoredGuess]);
    setCurrentGuess('');
  });

  const appendToGuess = useCallback((letter) => {
    if (currentGuess.length >= 5) return;
    const newCurrentGuess = `${currentGuess}${letter.toUpperCase()}`;
    setCurrentGuess(newCurrentGuess);
  });

  const deleteFromGuess = useCallback(() => setCurrentGuess(currentGuess.slice(0, currentGuess.length - 1)));

  useEffect(() => {
    if (guesses.length === 0) return;
    const isCorrect = l => l.classification === CLASSIFICATIONS.IN_WORD_RIGHT_PLACE;
    if (guesses[guesses.length - 1].every(isCorrect)) return setWon(true);
    if (guesses.length === 6) return setLost(true);
  }, [guesses]);

  useEffect(() => {
    document.querySelector('body').onkeydown = ({ key }) => {
      if (key === 'Enter') return makeGuess();
      if (key === 'Backspace') return deleteFromGuess();

      if (key.length !== 1) return;

      const code = key.charCodeAt(0);

      if (code >= 97 && code <= 122) return appendToGuess(key);
      if (code >= 65 && code <= 90) return appendToGuess(key);
    };
  }, [appendToGuess, makeGuess, deleteFromGuess]);

  return (
    <div className="App">
      <GuessChart
        guesses={guesses}
        currentGuess={currentGuess}
      />
      <Keyboard
        appendToGuess={appendToGuess}
        deleteFromGuess={deleteFromGuess}
        makeGuess={makeGuess}
        record={record}
      />
    </div>
  );
}

function GuessChart({ guesses, currentGuess }) {
  const chart = getChart(guesses, currentGuess);
  return (<div className="guess-chart">{chart.map(g => <Guess guess={g} />)}</div>);
}

function Guess({ guess }) {
  return (
    <div className="guess">
      {guess.map(guessedLetter => <GuessedLetter guessedLetter={guessedLetter} />)}
    </div>
  )
}

function GuessedLetter({ guessedLetter }) {
  const className = toClassName(guessedLetter.classification);
  const letter = guessedLetter.letter;
  return <span className={`guessed-letter ${className}`}>{letter}</span>
}

function Keyboard({ appendToGuess, deleteFromGuess, makeGuess, record }) {
  const toLetterKey = value => (
    <Key
      value={value}
      onPress={() => appendToGuess(value)}
      classification={record[value]}
    />
  );
  const topRow = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map(toLetterKey);
  const middleRow = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].map(toLetterKey);
  const coreBottomRow = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'].map(toLetterKey);
  const ent = <Key value={'ENT'} onPress={makeGuess} />;
  const del = <Key value={'DEL'} onPress={deleteFromGuess} />;

  return (
    <div className="keyboard">
      <div className="keyrow">
        {topRow}
      </div>
      <div className="keyrow offset">
        {middleRow}
      </div>
      <div className="keyrow offset">
        {[ent, ...coreBottomRow, del]}
      </div>
    </div>
  );
}

function Key({ value, onPress, classification }) {
  return (
    <span
      className={`key ${toClassName(classification)}`}
      onClick={onPress}
    >
      {value}
    </span>
  );
}

function score(secretWord, currentGuess) {
  const guess = getGuess(currentGuess);

  const secretLetters = secretWord.split('');
  const guessAccount = getAccount();
  const secretAccount = getAccount();

  scoreExactMatches(guess, secretLetters, guessAccount, secretAccount);
  scoreCloseMatches(guess, secretLetters, guessAccount, secretAccount);

  return guess;
}

function scoreExactMatches(guess, secretLetters, guessAccount, secretAccount) {
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i].letter !== secretLetters[i]) continue;
    guess[i].classification = CLASSIFICATIONS.IN_WORD_RIGHT_PLACE;
    guessAccount[i] = 1;
    secretAccount[i] = 1;
  }
}

function scoreCloseMatches(guess, secretLetters, guessAccount, secretAccount) {
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessAccount[i]) continue;
    const matchedLetterIdx = secretAccount.findIndex((a, j) => (guess[i].letter === secretLetters[j]) && !secretAccount[j]);
    if (matchedLetterIdx === -1) continue;
    guess[i].classification = CLASSIFICATIONS.IN_WORD_WRONG_PLACE;
    guessAccount[i] = 1;
    secretAccount[matchedLetterIdx] = 1;
  }
}

function getGuess(letters) {
  return letters.
    split('').
    map(l => ({
      classification: CLASSIFICATIONS.NOT_IN_WORD,
      letter: l.toUpperCase(),
    }));
}

function getDisplayableCurrentGuess(currentGuess) {
  const guess = getBlankGuess();
  currentGuess.split('').forEach((l, i) => guess[i].letter = l);
  return guess;
}

function getBlankGuess() {
  return (new Array(WORD_LENGTH).fill('')).map(l => ({ classification: CLASSIFICATIONS.IN_PROGRESS, letter: l }));
}

function getUpdatedRecord(record, scoredGuess) {
  const result = { ...record };
  scoredGuess.forEach(l => {
    if (result[l.letter] && RANKED_CLASSIFICATIONS[l.classification] <= RANKED_CLASSIFICATIONS[result[l.letter]]) return;
    result[l.letter] = l.classification
  });
  return result;
}

function toClassName(classification) {
  return (classification || '').toLowerCase().replace(/_/g, '-');
}

function getAccount() {
  return new Array(WORD_LENGTH).fill(0);
}

function getChart(guesses, currentGuess) {
  const chart = new Array(MAX_GUESSES).fill(getBlankGuess());
  for(let i = 0; i < guesses.length; i++) { chart[i] = guesses[i] }
  if (guesses.length === MAX_GUESSES) return chart;

  const displayableCurrentGuess = getDisplayableCurrentGuess(currentGuess);
  chart[guesses.length] = displayableCurrentGuess;
  return chart;
}

export default App;
