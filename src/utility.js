const _exec = require("child_process").exec;
const { reduce } = require("lodash/collection");
const { isArray } = require("lodash/lang");

const arrayify = item => (Array.isArray(item) ? item : [item]);

/**
 * Async helper for running git commands with common error callback function
 * @param command - Program to run
 */
async function exec(command) {
  return new Promise((resolve, reject) => {
    _exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(`error: ${error.message}`);
      }
      if (stderr) {
        return reject(`stderr: ${stderr}`);
      }
      resolve(stdout);
    });
  });
}

/**
 * Extracts key-value pairs from an array of objects, creating a new object.
 *
 * combineByKeys([
 *     { key: "key1", value: "value1" },
 *     { key: "key2", value: "value2" }
 * ], "key", "value");
 *
 * result: { key1: "value1", key2: "value2" }
 *
 * @param array
 * @param keyProp
 * @param valueProp
 * @returns {*}
 */
function combineByKeys(array, keyProp, valueProp) {
  return reduce(
    array,
    (acc, element) => {
      let value;
      if (Object.prototype.hasOwnProperty.call(acc, element[keyProp])) {
        if (isArray(acc[element[keyProp]])) {
          value = [...acc[element[keyProp]], element[valueProp]];
        } else {
          value = [acc[element[keyProp]], element[valueProp]];
        }
      } else {
        value = element[valueProp];
      }
      return { ...acc, [element[keyProp]]: value };
    },
    {}
  );
}

module.exports = { arrayify, exec, combineByKeys };
