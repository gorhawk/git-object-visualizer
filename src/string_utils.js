const brackets = exp => `[${exp}]`;
const angles = exp => `<${exp}>`;
const quote = exp => `"${exp}"`;
const head8 = str => str.substr(0, 8);
const splitLines = string => string.split("\n");
const splitByWhitespace = string => string.split(/\s+/);

module.exports = { brackets, angles, quote, head8, splitLines, splitByWhitespace };
