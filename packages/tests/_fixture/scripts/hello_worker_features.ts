import { execSyncAndGetStdout, httpRequest } from "^jab-node";
import fs from "fs";
import path from "path";
import { parentPort, workerData, isMainThread } from "worker_threads";
import WebSocket from "ws";

//no problem

setTimeout(() => {
  console.log(
    "file: ",
    fs.readFileSync(path.join(__dirname, "hello.js")).toString()
  );
}, 1000);

//out

console.log("parentPort: ", parentPort);
console.log("isMain: ", isMainThread);
console.log("workerData: ", workerData);

//process

console.log(
  "hello.js stdout: ",
  execSyncAndGetStdout("node", [path.join(__dirname, "hello.js")])
);

//http request and web socket

httpRequest({ port: 3003 })
  .then((data) => {
    console.log("http: ", data);
  })
  .then(() => {
    const ws = new WebSocket("ws://localhost:3003/jate/ws");

    ws.on("open", function open() {
      console.log("ws open");
      setTimeout(() => {
        ws.close();
        console.log("ws close");
      }, 500);
    });
  });
