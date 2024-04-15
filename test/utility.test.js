const { combineByKeys } = require("../src/utility");

QUnit.module("utility");

const data = [
    { type: "KEY1", hash: "ABC_123" },
    { type: "KEY2", hash: "DEF_456" },
    { type: "KEY_DUP", hash: "VAL1" },
    { type: "KEY_DUP", hash: "VAL2" },
];

QUnit.test("combineByKeys: uses correct key and value", assert => {
    const combined = combineByKeys(data, "type", "hash");
    assert.equal(combined.KEY1, "ABC_123");
    assert.equal(combined.KEY2, "DEF_456");
});

QUnit.test("combineByKeys: aggregates values for duplicate keys", assert => {
    const combined = combineByKeys(data, "type", "hash");
    const expected = ["VAL1", "VAL2"];
    assert.true(
        Array.isArray(combined.KEY_DUP) && combined.KEY_DUP.length === expected.length,
        "Not an array"
    );
    assert.true(
        expected.every((value, index) => value === combined.KEY_DUP[index]),
        "Arrays not equal"
    );
});
