const romanDigits = ['I', 'V', 'X', 'L', 'C', 'D', 'M'];

export const hasRomanDigits = (value) =>
  romanDigits.some((romanDigit) => String(value).includes(romanDigit));

export const hasArabicDigits = (value) => String(value).search(/[0-9]+/) !== -1;

export const removeNonRomanSymbols = (value) =>
  String(value)
    .match(new RegExp(`[${romanDigits.join('')}]`, 'g'))
    .join('');

export const removeNonArabicSymbols = (value) =>
  String(value).match(/[0-9]/g).join('');

export const isValidRomanNumber = (value) =>
  new RegExp(/^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/).test(
    String(value),
  );

export const isValidArabicNumber = (value) => value > 0 && value < 4000;
