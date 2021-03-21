process.on("message", (msg) => {
  switch (msg.type) {
    case "shutdown":
      process.exit();
      break;
    default:
      throw new Error("Unknown message." + msg);
  }
});

console.log("hello js");
console.error("hello error");

// throw new Error("ups");

// process.exit();
