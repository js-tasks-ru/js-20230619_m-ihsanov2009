/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */

const OPTIONS = "ru-RU-u-kf-upper";

export function sortStrings(arr, param = "asc") {
  return [...arr].sort((a, b) =>
    param === "desc" ? b.localeCompare(a, OPTIONS) : a.localeCompare(b, OPTIONS)
  );
}
