var fs = require("fs");

process.on("message", (message) => {
  switch (message.type) {
    case "echo":
      process.send({ type: "msg", value: message.value });
      break;

    case "shutdown":
      console.log("shutting down");
      process.exit();
      break;

    default:
      throw new Error("helloBlock.js : Unknown message." + message);
  }
});

process.send({ type: "msg", value: "waiting for stdin" });

var fd = process.stdin.fd;

var buf = Buffer.alloc(100);

try {
  const bytesRead = fs.readSync(fd, buf, 0, 100, null);
  console.log("got bytes", bytesRead);
} catch (e) {
  if (e.code === "EOF") {
    console.log("shutdown signal i stdin.");
    process.exit();
  }
}

console.log("after sync wait");
