import {
  hasRomanDigits,
  hasArabicDigits,
  removeNonRomanSymbols,
  removeNonArabicSymbols,
  isValidRomanNumber,
  isValidArabicNumber,
} from './utils.js';
import { convert } from './converter.js';

const converterInputNode = document.querySelector('.converter__input');
const converterOutputNode = document.querySelector('.converter__output');

let lastInputValue = converterInputNode.value;

const getInputValue = (value) => {
  if (value === '') {
    return '';
  }

  const currentValue = value.toUpperCase();

  let resultValue = currentValue;

  if (hasRomanDigits(resultValue)) {
    if (hasArabicDigits(resultValue) && hasArabicDigits(lastInputValue)) {
      resultValue = removeNonArabicSymbols(resultValue);

      if (!isValidArabicNumber(resultValue)) {
        resultValue = lastInputValue;
      }
    } else {
      resultValue = removeNonRomanSymbols(resultValue);

      if (!isValidRomanNumber(resultValue)) {
        resultValue = lastInputValue;
      }
    }

    if (!isValidRomanNumber(resultValue)) {
      resultValue = lastInputValue;
    }
  } else if (hasArabicDigits(resultValue)) {
    resultValue = removeNonArabicSymbols(resultValue);

    if (!isValidArabicNumber(resultValue)) {
      resultValue = lastInputValue;
    }
  } else {
    resultValue = '';
  }

  lastInputValue = resultValue;

  return resultValue;
};

const getOutputValue = (value) => {
  if (value === '') {
    return '';
  }

  const resultValue = convert(value);

  return `\xa0\xa0=\xa0\xa0${resultValue}`;
};

const onConverterInput = () => {
  return (evt) => {
    evt.preventDefault();

    const currentCursorPosition = evt.target.selectionStart;
    const previousResultInputValueLength = lastInputValue.length;

    const resultInputValue = getInputValue(converterInputNode.value);
    converterInputNode.value = resultInputValue;

    if (resultInputValue.length === previousResultInputValueLength) {
      converterInputNode.setSelectionRange(
        resultInputValue.length,
        resultInputValue.length,
      );
    } else {
      converterInputNode.setSelectionRange(
        currentCursorPosition,
        currentCursorPosition,
      );
    }

    converterOutputNode.textContent = getOutputValue(resultInputValue);
  };
};

converterInputNode.addEventListener('input', onConverterInput());
