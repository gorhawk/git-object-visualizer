const { combineByKeys } = require("../src/utility");

QUnit.module("utility");

const data = [
    {
        type: "KEY1",
        hash: "ABC_123",
    },
    {
        type: "KEY2",
        hash: "DEF_456",
    }
];

QUnit.test("combineByKeys: uses correct key and value", assert => {
    const combined = combineByKeys(data, "type", "hash");
    assert.equal(combined.KEY1, "ABC_123");
    assert.equal(combined.KEY2, "DEF_456");
});
