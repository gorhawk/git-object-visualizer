const fs = require("fs");
const { flattenDepth, zipWith, compact } = require("lodash/array");
const { exec } = require("./utility");
const { splitLines, splitByWhitespace } = require("./string_utils");
const { isEmpty } = require("lodash/lang");
const { map, filter } = require("lodash/collection");
const { stmtList, digraph } = require("./dot_builders");
const {
    mapRawCommit,
    mapRawTree,
    mapAnnotatedTag,
    mapLineToRef,
    mapLineToObject,
    mapBlobToStatement,
    mapCommitToStatements,
    mapTreeToStatements,
    mapHeadToStatements,
    mapAnnotatedTagsToStatements,
    mapTagToStatements,
} = require("./git_mappers");

// strip off node executable and script path
const args = process.argv.slice(2);

if (isEmpty(args)) {
    console.log("No arguments given. (git-dir is required as first argument)");
    process.exit(1);
}

const BLOB_TYPE = "blob";
const TREE_TYPE = "tree";
const TAG_TYPE = "tag";
const COMMIT_TYPE = "commit";
const PARENT_TYPE = "parent";

const commitTypes = [COMMIT_TYPE, PARENT_TYPE];

const isBlob = object => object.type === BLOB_TYPE;
const isTree = object => object.type === TREE_TYPE;
const isTag = object => object.type === TAG_TYPE;
const isCommit = object => commitTypes.includes(object.type);
const getHash = object => object.hash;

const [gitDir, ...opts] = args.sort((a, b) => (a.startsWith("--") ? 1 : -1)); // sorry
const git = `git --git-dir=${gitDir}`;
const noBlobs = opts.includes("--no-blobs");

const showHeads = () => exec(`${git} show-ref --heads`);
const showTags = () => exec(`${git} show-ref --tags`);
const catAllObjects = () => exec(`${git} cat-file --batch-check --batch-all-objects`);
const catFile = hash => exec(`${git} cat-file -p ${hash}`);
const catObject = gitObject => catFile(getHash(gitObject));

async function main() {
    const gitObjectLines = compact(splitLines(await catAllObjects()));
    const gitObjects = map(gitObjectLines, mapLineToObject);

    // sort out the three types of git objects,
    // so we can further analyze the dependencies of commits, trees and tags
    const blobs = filter(gitObjects, isBlob);
    const commits = filter(gitObjects, isCommit);
    const trees = filter(gitObjects, isTree);
    const tags = filter(gitObjects, isTag);

    // additional git-cat-file commands need to be run for every object,
    // and we represent these abstract I/O operations with collections of promises
    const commitCatOps = map(commits, catObject);
    const treeCatOps = map(trees, catObject);
    const tagCatOps = map(tags, catObject);

    const rawCommits = await Promise.all(commitCatOps);
    const rawTrees = await Promise.all(treeCatOps);
    const rawTags = await Promise.all(tagCatOps);

    const addHashToObject = (hash, data) => ({ ...data, hash });

    const commitData = zipWith(
        map(commits, getHash),
        compact(map(rawCommits, mapRawCommit)),
        addHashToObject
    );

    const treeData = zipWith(
        map(trees, getHash),
        compact(map(rawTrees, mapRawTree)),
        addHashToObject
    );

    const annotatedTagData = zipWith(
        map(tags, getHash),
        compact(map(rawTags, mapAnnotatedTag)),
        addHashToObject
    );

    // git HEAD could be detached, referring directly to a commit, not another ref
    const rawHEAD = fs.readFileSync(`${gitDir}/HEAD`).toString();
    const HEAD = rawHEAD.startsWith("ref:") ? splitByWhitespace(rawHEAD)[1] : rawHEAD;

    // there may be no tags at all, which throws an I/O error
    const tagData = map(compact(splitLines(await showTags().catch(error => ""))), mapLineToRef);
    const headData = map(compact(splitLines(await showHeads())), mapLineToRef);

    const statementsByType = [
        !noBlobs && map(blobs, mapBlobToStatement),
        map(commitData, mapCommitToStatements),
        map(treeData, data => mapTreeToStatements(data, noBlobs)),
        map(headData, mapHeadToStatements),
        mapHeadToStatements({ hash: HEAD, name: "HEAD" }),
        map(annotatedTagData, mapAnnotatedTagsToStatements),
        map(tagData, mapTagToStatements),
    ];

    const statements = flattenDepth(compact(statementsByType), 2);

    return digraph("g", stmtList(statements));
}

module.exports = main;
