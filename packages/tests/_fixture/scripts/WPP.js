// - require files, so WPP can change them, and test its reloading.

const library = require("../scratchFolder/FileThatChanges");
const library2 = require("../scratchFolder/FileThatChanges2");

//values that can change in files

console.log("library value: " + library);
console.log("library2 value: " + library2);
