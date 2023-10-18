import { hasRomanDigits, hasArabicDigits } from './utils.js';

const ArabicNums = {
  1: 'I',
  5: 'V',
  10: 'X',
  50: 'L',
  100: 'C',
  500: 'D',
  1000: 'M',
};

const RomanNums = {
  M: 1000,
  CM: 900,
  D: 500,
  CD: 400,
  C: 100,
  XC: 90,
  L: 50,
  XL: 40,
  X: 10,
  IX: 9,
  V: 5,
  IV: 4,
  I: 1,
};

const convertToArabic = (roman) => {
  let romanNumber = roman;
  let result = 0;

  while (romanNumber.length > 0) {
    const firstTwoLetters = romanNumber.slice(0, 2);

    if (Object.prototype.hasOwnProperty.call(RomanNums, firstTwoLetters)) {
      result += RomanNums[firstTwoLetters];
      romanNumber = romanNumber.slice(2, romanNumber.length);
      continue;
    }

    result += RomanNums[romanNumber[0]];
    romanNumber = romanNumber.slice(1, romanNumber.length);
  }

  return result;
};

const convertToRoman = (arabic) => {
  let result = '';
  const digits = String(arabic)
    .split('')
    .map((digit) => Number(digit));

  digits.forEach((digit, i) => {
    let romanDigit;
    const roundedNumber = String(digit * 10 ** (digits.length - 1 - i));
    const firstDigit = Number(roundedNumber[0]);
    const zerosCount = roundedNumber.length - 1;

    if (firstDigit === 0) {
      return;
    }

    if (firstDigit >= 1 && firstDigit <= 3) {
      romanDigit = `${ArabicNums[roundedNumber / firstDigit].repeat(
        firstDigit,
      )}`;
    }

    if (firstDigit === 4) {
      const firstRomanDigit =
        ArabicNums[Number(roundedNumber) - 3 * 10 ** zerosCount];
      const secondRomanDigit =
        ArabicNums[Number(roundedNumber) + 10 ** zerosCount];

      romanDigit = `${firstRomanDigit}${secondRomanDigit}`;
    }

    if (firstDigit === 5) {
      romanDigit = `${ArabicNums[roundedNumber]}`;
    }

    if (firstDigit >= 6 && firstDigit <= 8) {
      const firstRomanDigitInDecimal =
        Number(roundedNumber) - (firstDigit - 5) * 10 ** zerosCount;
      const firstRomanDigit = ArabicNums[firstRomanDigitInDecimal];
      const secondRomanDigit = `${ArabicNums[
        firstRomanDigitInDecimal - 4 * 10 ** zerosCount
      ].repeat(firstDigit - 5)}`;

      romanDigit = `${firstRomanDigit}${secondRomanDigit}`;
    }

    if (firstDigit === 9) {
      const firstRomanDigit =
        ArabicNums[Number(roundedNumber) - 8 * 10 ** zerosCount];
      const secondRomanDigit =
        ArabicNums[Number(roundedNumber) + 10 ** zerosCount];

      romanDigit = `${firstRomanDigit}${secondRomanDigit}`;
    }

    result += romanDigit;
  });

  return result;
};

export const convert = (value) => {
  if (value === '') {
    return '';
  }

  const currentValue = value.toUpperCase();

  let resultValue;

  if (hasArabicDigits(currentValue)) {
    resultValue = convertToRoman(currentValue);
  }

  if (hasRomanDigits(currentValue)) {
    resultValue = convertToArabic(currentValue);
  }

  return resultValue;
};
