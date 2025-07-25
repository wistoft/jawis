var assert = require("assert");

describe("Hello mocha", function () {
  describe("assert", function () {
    it("1 === 1", function () {
      assert.strictEqual(1, 1);
    });
  });
});

describe("Hello mocha", function () {
  describe("wait", function () {
    it("for done", function (done) {
      setTimeout(() => {
        done();
      }, 100);
    });
  });
});
