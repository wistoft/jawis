var assert = require("assert");

describe("Jest", function () {
  describe("describe", function () {
    it("my.test", function () {
      // console.log("in test");
      // assert.strictEqual(1, 2);

      // throw new Error("ups");
      assert.equal(1, 1);
    });
  });
});

describe("Jest", function () {
  describe("igen", function () {
    it("should something", function (done) {
      console.log("hej");
      expect("hej").toMatchSnapshot();
      expect("dav").toMatchSnapshot();
      // assert.equal(1, 2);
      // throw new Error("ups");
      // setTimeout(() => {
      //   console.log("hello herhe");
      // }, 2000);
      // Calling `done()` twice is an error
      // setImmediate(done);
      // console.log("hej");
      setTimeout(() => {
        done();
      }, 20);
      // throw new Error("ups");
    });
  });
});

describe("Jest", function () {
  describe("igen", function () {
    it("should something 2", function () {
      // Calling `done()` twice is an error
      // setImmediate(done);
      // setTimeout(() => {
      //   done();
      // }, 500);
      // throw new Error("ups");
    });
  });
});
//
