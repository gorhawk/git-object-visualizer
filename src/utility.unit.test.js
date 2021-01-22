const { combineByKeys } = require("./utility");

describe("utility", () => {
  describe("combineWithKeys", () => {
    it("should handle multiple values (create array)", function () {
      const data = [
        { type: "tree", hash: "96b1" },
        { type: "parent", hash: "9664" },
        { type: "parent", hash: "8976" },
      ];
      const result = combineByKeys(data, "type", "hash");
      expect(Array.isArray(result.parent)).toBeTruthy();
    });
  });
});
