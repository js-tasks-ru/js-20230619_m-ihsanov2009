/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */

export function createGetter(path) {
  const pathKeys = path.split(".");
  return function (obj) {
    let property = JSON.parse(JSON.stringify(obj));
    pathKeys.map((key) => {
      if (property === undefined) {
        return undefined;
      }
      return property[key]
        ? (property = property[key])
        : (property = undefined);
    });
    return property;
  };
}
