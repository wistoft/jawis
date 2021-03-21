const library = require("./_library/FileThatChanges");

export default function testCase() {
  if (library === 666) {
    return new Promise(() => {});
  } else {
    return "library value: " + library;
  }
}
