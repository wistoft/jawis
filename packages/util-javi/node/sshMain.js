// It will be a fatal error, if this send stdout. stderr is fine.

console.log = console.error;

// for sending IPC

const send = (msg) => {
  process.stdout.write(JSON.stringify(msg) + "\x00");
};

// take over the messages coming on stdin.

//we need to ensure the controller doesn't send on stdin, before we do this.
global.onStdinMessage = (data) => {
  const msg = JSON.parse(data);

  switch (msg.type) {
    case "makeBee":
      eval("console.error('there be code')");
      // const file = "./tmp.code.js";
      // fs.writeFileSync(file, );
      // require(file);
      break;

    case "shutdown":
    case "kill":
      //nothing to shutdown yet.
      send({ type: "exit", fileUrl: msg.fileUrl, data: 0 });
      return;

    case "message":
      throw new Error("not impl: " + msg.type);

    default:
      throw new Error("unknown message: " + msg.type);
  }
};

//Regard closed connection as kill.
// Problem: it makes this process keep running, even when the event loop is empty.

process.stdin.on("close", () => {
  //todo: ensure bees are killed.
  process.exit();
});

//
// ready
//

send({ type: "ready" });
