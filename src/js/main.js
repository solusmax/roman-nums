import { hasRomanDigits, hasArabicDigits, removeNonRomanSymbols, removeNonArabicSymbols, isValidRomanNumber, isValidArabicNumber } from './utils.js';
import { convert } from './converter.js';

const converterInputNode = document.querySelector('.converter__input');
const converterOutputNode = document.querySelector('.converter__output');

let lastInputValue = converterInputNode.value;

const getInputValue = (value) => {
  if (value === '') {
    return '';
  }

  let resultValue = value;

  if (hasRomanDigits(resultValue)) {
    resultValue = removeNonRomanSymbols(resultValue);

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

    const resultInputValue = getInputValue(converterInputNode.value);

    converterInputNode.value = resultInputValue;
    converterOutputNode.textContent = getOutputValue(resultInputValue);
  };
};

converterInputNode.addEventListener('input', onConverterInput());
