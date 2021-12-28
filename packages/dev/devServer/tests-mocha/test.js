var assert = require("assert");

describe("Array", function () {
  describe("#indexOf()", function () {
    it("should return -1 when the value is not present", function () {
      // console.log("in test");
      // assert.strictEqual(1, 2);

      assert.equal(1, 1);
    });
  });
});

describe("Hello mocha", function () {
  describe("igen", function () {
    it("should something", function (done) {
      // Calling `done()` twice is an error
      // setImmediate(done);
      // console.log("hej");
      setTimeout(() => {
        done();
      }, 500);

      // throw new Error("ups");
    });
  });
});

describe("Hello mocha", function () {
  describe("igen", function () {
    it("should something 2", function (done) {
      // Calling `done()` twice is an error
      // setImmediate(done);
      setTimeout(() => {
        done();
      }, 500);

      // throw new Error("ups");
    });
  });
});
//
