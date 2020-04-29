const { brackets, quote } = require("./string_utils");
const { arrayify } = require("./utility");
const { compact } = require("lodash/array");

const attr = (name, value) => ({ name, value });
const lines = (...lines) => lines.join("\n");
const digraph = (name, statementList) => `digraph ${name} {${statementList}}`;
const subgraph = (statementList, name = "") => `subgraph ${name} {${statementList}}`;
const stmtList = statements => arrayify(statements).join(";\n");
const stmt = (...args) => args.join(" ");

const attrList = (...attributes) =>
    brackets(
        arrayify(attributes)
            .map(a => `${a.name}=${a.value}`)
            .join(" ")
    );

const addressPort = (node, port) => `${node}:${port}`;
const edge = (src, dest) => `${src} -> {${arrayify(dest).map(quote).join(" ")}}`;

module.exports = {
    attr,
    digraph,
    subgraph,
    stmtList,
    stmt,
    attrList,
    addressPort,
    edge,
    lines,
};
