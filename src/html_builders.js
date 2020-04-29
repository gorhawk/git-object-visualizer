const { compact } = require("lodash/array");
const { arrayify } = require("./utility");

const attrList = attributes =>
    compact(arrayify(attributes))
        .map(a => `${a.name}="${a.value}"`)
        .join(" ");

const createTag = (type, attributes, content) =>
    `<${type} ${attrList(attributes)}>${content}</${type}>`;

const td = createTag.bind(null, "td");
const tr = createTag.bind(null, "tr");
const table = createTag.bind(null, "table");

module.exports = { attrList, createTag, td, tr, table };
