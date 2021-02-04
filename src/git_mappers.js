const { table, tr, td } = require("./html_builders");
const { attr, attrList, stmt, edge, lines } = require("./dot_builders");
const { truncate, replace } = require("lodash/string");
const { map, reduce } = require("lodash/collection");
const { compact } = require("lodash/array");
const { combineByKeys } = require("./utility");
const { quote, splitLines, splitByWhitespace, brackets, angles, head8 } = require("./string_utils");

const headPath = "refs/heads/";
const tagPath = "refs/tags/";
const remoteHeadPath = "refs/remotes/";

const TREE_TYPE = "tree";
const PARENT_TYPE = "parent";

const commitDependencyTypes = [TREE_TYPE, PARENT_TYPE];

function mapLineToCommit(line) {
  const [type, hash] = splitByWhitespace(line);
  if (commitDependencyTypes.includes(type)) {
    return { type, hash };
  }
}

function mapLineToTree(line) {
  const [mode, type, hash, filename] = splitByWhitespace(line);
  return { type, hash, filename };
}

function mapLineToRef(line) {
  const [hash, name] = splitByWhitespace(line);
  return { hash, name };
}

function mapLineToObject(line) {
  const [hash, type] = splitByWhitespace(line);
  return { hash, type };
}

/**
 * Maps raw commit data to an object.
 * In the git commit 'object', the first double newline separates
 * the metadata from the commit message. This function splits the
 * raw data by double newlines, but then treats all but the first
 * element as the message, so it can be rejoined later.
 */
function mapRawCommit(rawCommit) {
  // commit message may contain double newlines
  const [meta, ...msg] = rawCommit.split("\n\n");
  const dependencies = compact(map(compact(splitLines(meta)), mapLineToCommit));
  return {
    ...combineByKeys(dependencies, "type", "hash"),
    msg: msg.join("\n\n").trim(), // rejoin the commit message to restore newlines
  };
}

function mapAnnotatedTag(rawTag) {
  const [rawMetadata, message] = rawTag.split("\n\n");
  return reduce(
    // the first 3 lines are: object, type, tag
    map(splitLines(rawMetadata).slice(0, 3), line => {
      const [key, value] = splitByWhitespace(line);
      return { [key]: value };
    }),
    (acc, item) => ({ ...acc, ...item }),
    { message: truncate(message.replace("\n", "\\n").trim()) }
  );
}

const mapRawTree = rawTree => ({
  children: compact(map(compact(splitLines(rawTree)), mapLineToTree)),
});

////////////////////////////////////////
////////// statement builders //////////
////////////////////////////////////////

function mapBlobToStatement({ hash }) {
  return stmt(quote(hash), attrList(attr("label", quote(head8(hash))), attr("shape", "plaintext")));
}

function mapCommitToStatements({ hash, parent, tree, msg }, skipTrees = false) {
  const result = [
    stmt(
      quote(hash),
      attrList(
        // TODO: option to display msg, commit message (join with "\\n")
        attr("label", quote(head8(hash) + "\\n" + msg.substring(0, 25))),
        attr("shape", "rect"),
        attr("style", '"filled, rounded"'),
        attr("fillcolor", "gainsboro"),
        /**
         * TODO: make it optional to group commits
         * (so that the engine tries to form straight
         * edges between them and avoid crossings) 
         */
        // attr("group", "commits")
      )
    ),
  ];
  if (!skipTrees) {
    // TODO: options for arrow types
    result.push(stmt(edge(quote(hash), tree, "" /* "[style=dashed arrowhead=empty]" */)));
  }
  if (parent) {
    result.push(stmt(edge(quote(hash), parent)));
  }
  return result;
}

function mapAnnotatedTagsToStatements({ message, object, type, tag, hash }) {
  return [
    stmt(
      quote(hash),
      attrList(
        attr("label", quote(head8(hash) + "\\n" + message)),
        attr("shape", "rect"),
        attr("style", "filled"),
        attr("fillcolor", "wheat"),
        attr("group", "tags")
      )
    ),
    stmt(edge(quote(hash), object)),
  ];
}

const mapTreeToStatements = ({ hash, children }, skipBlobs = false) => {
  const tableAttributes = [attr("border", 0), attr("cellborder", 1), attr("cellspacing", 0)];
  const rows = lines(
    tr(null, td(attr("colspan", 3), `tree ${head8(hash)}`)),
    ...map(children, ({ type, hash, filename }) =>
      tr(null, lines(td(null, type), td(null, head8(hash)), td(attr("port", hash), filename)))
    )
  );
  const treeTable = angles(table(tableAttributes, rows));
  const attributes = [
    attr("shape", "plain"),
    attr("label", treeTable),
    // attr("group", "trees")
  ];

  const treeHash = hash;

  return [
    stmt(quote(treeHash), attrList(...attributes)),
    ...children
      .filter(({ type }) => !(skipBlobs && type === "blob"))
      .map(({ type, hash, filename }) =>
        // TODO: options for arrows
        edge(quote(treeHash), hash, "" /* "[style=dotted arrowhead=empty]" */)
      ),
  ];
};

const createRefMapper = ({ refBasePath, fillColor, shape, margin }) => ({ hash, name }) => {
  return [
    stmt(
      quote(name),
      attrList(
        attr("label", quote(replace(name, refBasePath, ""))),
        attr("style", "filled"),
        attr("fillcolor", fillColor),
        attr("shape", shape),
        attr("margin", margin)
      )
    ),
    edge(quote(name), hash.trim()),
  ];
};

const mapHeadToStatements = createRefMapper({
  refBasePath: headPath,
  shape: "rect",
  fillColor: "lightblue",
  margin: 0.1,
});

const mapRemoteHeadToStatements = createRefMapper({
  refBasePath: remoteHeadPath,
  shape: "rect",
  fillColor: "plum",
  margin: 0.1,
});

const mapTagToStatements = createRefMapper({
  refBasePath: tagPath,
  shape: "cds",
  fillColor: "lightsalmon",
  margin: 0.2,
});

module.exports = {
    mapLineToObject,
    mapLineToRef,
    mapRawCommit,
    mapRawTree,
    mapAnnotatedTagsToStatements,
    mapAnnotatedTag,
    mapHeadToStatements,
    mapTagToStatements,
    mapRemoteHeadToStatements,
    mapTreeToStatements,
    mapCommitToStatements,
    mapBlobToStatement,
};
