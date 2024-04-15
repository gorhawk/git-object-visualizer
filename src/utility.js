const _exec = require("child_process").exec;
const { reduce } = require("lodash/collection");
const { isArray } = require("lodash/lang");

const arrayify = item => (Array.isArray(item) ? item : [item]);

async function exec(...args) {
    return new Promise((resolve, reject) => {
        _exec(...args, (error, stdout, stderr) => {
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

function combineByKeys(array, keyProp, valueProp) {
    return reduce(
        array,
        (acc, element) => {
            const key = element[keyProp];
            const value = element[valueProp];
            // default case, add value to object
            if (!acc.hasOwnProperty(key)) {
                acc[key] = value;
                return acc;
            }
            // second value for the same key, initialize array
            if (!isArray(acc[key])) {
                acc[key] = [acc[key], value];
                return acc;
            }
            // it's already an array
            acc[key].push(value);
            return acc;
        },
        {}
    );
}

module.exports = { arrayify, exec, combineByKeys };
