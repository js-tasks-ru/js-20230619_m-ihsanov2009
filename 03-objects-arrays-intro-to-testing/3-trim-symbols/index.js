/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  const countLetters = [];
  let currIndex = 0;
  string.split("").forEach((item, index, arr) => {
    if (item !== arr[index + 1] || index + 1 === string.length) {
      const newItem = arr.slice(currIndex, index + 1).join("");
      if (newItem.length > size) {
        countLetters.push(newItem.slice(0, size));
      } else {
        countLetters.push(newItem);
      }
      currIndex = index + 1;
    }
  });
  return countLetters.join("");
}
