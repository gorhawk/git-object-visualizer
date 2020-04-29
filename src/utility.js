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
        (acc, element) => ({
            ...acc,
            [element[keyProp]]: isArray(acc[element[keyProp]])
                ? [...acc[element[keyProp]], element[valueProp]]
                : element[valueProp],
        }),
        {}
    );
}

module.exports = { arrayify, exec, combineByKeys };
