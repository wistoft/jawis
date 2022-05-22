console.log("hej");
console.log("dav"); //works fine in process

process.on("exit", function () {
  // process.exit(0);
});

throw new Error("ups");
