const cp = require("child_process");

const proc = cp.spawn("node", ["hello.js"], {
  stdio: ["inherit", "inherit", "inherit"],
  cwd: __dirname,
});

// proc.stdout.on("data", (data) => {
//   process.stdout.write(data);
//   // console.log(data.toString());
// });

// proc.stderr.on("data", (data) => {
//   console.log("stdout");
// });

// // console.log(cp.execSync("node " + script, { cwd: __dirname }).toString());
