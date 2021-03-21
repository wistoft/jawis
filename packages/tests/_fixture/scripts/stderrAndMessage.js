#!/usr/bin/env node

setTimeout(() => {
  process.stderr.write("This is too late to be registered");
}, 0);

process.stderr.write("You are having a problem");

process.send({ type: "msg", value: "kill me" });
