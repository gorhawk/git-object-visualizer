const { compact } = require("lodash/array");

const brackets = exp => `[${exp}]`;
const angles = exp => `<${exp}>`;
const quote = exp => `"${exp}"`;
const arrayify = item => (Array.isArray(item) ? item : [item]);
const head8 = hash => hash.substr(0, 8);
const attr = (name, value) => ({ name, value });
const lines = (...lines) => lines.join("\n");

const digraph = (name, statementList) => `digraph ${name} {${statementList}}`;
const subGraph = (statementList, name = "") => `subgraph ${name} {${statementList}}`;
const statementList = statements => arrayify(statements).join(";\n");
const stmt = (...args) => args.join(" ");

const attributeList = (...attributes) =>
    brackets(
        arrayify(attributes)
            .map(a => `${a.name}=${a.value}`)
            .join(" ")
    );

const hAttrList = attributes =>
    compact(arrayify(attributes))
        .map(a => `${a.name}="${a.value}"`)
        .join(" ");

const createTag = (type, attributes, content) =>
    `<${type} ${hAttrList(attributes)}>${content}</${type}>`;

const td = createTag.bind(null, "td");
const tr = createTag.bind(null, "tr");
const table = createTag.bind(null, "table");
const addressPort = (node, port) => `${node}:${port}`;
const edge = (src, dest) => `${src} -> {${arrayify(dest).map(quote).join(" ")}}`;

module.exports = {
    brackets,
    angles,
    quote,
    arrayify,
    head8,
    attr,
    digraph,
    subGraph,
    statementList,
    stmt,
    attributeList,
    hAttrList,
    createTag,
    td,
    tr,
    table,
    addressPort,
    edge,
    lines,
};
