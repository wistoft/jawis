const cp = require("child_process");

const script = process.env["SPAWN_SCRIPT"];

const proc = cp.spawn("node", [script], {
  stdio: ["ignore", "ignore", "ignore"],
  cwd: __dirname,
  detached: true,
});

proc.unref();
