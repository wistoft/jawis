//
// functions
//

global.onStdinMessage = (msg) => {
  eval(msg);
};

//
// my boot is made for buzzing.
//

let buffer = "";

//code duplicated with: makeOnJsonOverStdout
//bug: what about chunks containing multiple nul-bytes.

process.stdin.on("data", (data) => {
  buffer += data;

  const pos = buffer.indexOf("\x00");

  if (pos !== -1) {
    global.onStdinMessage(buffer.slice(0, pos));

    buffer = buffer.slice(pos + 1); //removes the newline
  }
});
