const cp = require("child_process");

const script = process.env["SPAWN_SCRIPT"];

const proc = cp.spawn("node", [script], {
  stdio: ["pipe", "pipe", "pipe"],
  cwd: __dirname,
});

proc.stdout.on("data", (data) => {
  process.stdout.write(data);
});

proc.stderr.on("data", (data) => {
  process.stderr.write(data);
});
