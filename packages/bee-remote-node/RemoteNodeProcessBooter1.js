//Takes a single piece of javacript code from stdin and executes it.
// A short script, that can be used as command-line argument.

// Sideeffect is that the process is hindered from exiting, until `stdin.unref` is called.

let buffer = "";

const listener = (data) => {
  buffer += data;

  const pos = buffer.indexOf("\x00");

  if (pos !== -1) {
    process.stdin.off("data", listener); //not enough to allow process to exit.

    eval(buffer.slice(0, pos));
  }
};

process.stdin.on("data", listener);
