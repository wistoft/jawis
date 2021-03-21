import slashes from "connect-slashes";
import express from "express";
import path from "path";

const app = express();

// ensure slashes

app.use(slashes());

//
// front page
//

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

//
// routes
//

app.get("/helloStdout", (req, res) => {
  console.log("hello there");
  res.send("written to stdout.");
});

app.get("/helloStderr", function (req, res) {
  process.stderr.write("hello stderr");
  res.send("written to stderr.");
});

app.get("/doubleSend", function (req, res) {
  res.send("doubleSend");
  res.send("doubleSend again"); // not allowed
});

app.get("/doubleEnd", function (req, res) {
  res.end("doubleEnd");
  res.end("doubleEnd - lost message"); // this is a silent bug.
});

app.get("/writeAndEnd", function (req, res) {
  // gather

  const h1 = res.headersSent ? "sent" : "not sent";
  res.write("writing" + "\n");
  const h2 = res.headersSent ? "sent" : "not sent";

  // output

  res.write("Before writing: " + h1 + "\n");
  res.write("After  writing: " + h2 + "\n");

  // end

  res.end("ending" + "\n");
  // res.send("sending");	//this is an error, because headers are already sent.
});

app.get("/kill", function (req, res) {
  res.end("Shutting down.");
  process.exit();
});

//
// throwing
//

app.use("/timeoutThrowing", (req, res) => {
  setTimeout(() => {
    throw new Error("did my promise");
  }, 0);
});

app.use("/timeoutThrowingAndEnd", (req, res) => {
  setTimeout(() => {
    throw new Error("my promise, I did");
  }, 0);
  res.end("throwing");
});

app.use("/promiseThrowing", (req, res) => {
  new Promise(() => {
    throw new Error("did my promise");
  });
});

app.use("/promiseThrowingAndEnd", (req, res) => {
  new Promise(() => {
    throw new Error("my promise, I did");
  });
  res.end("throwing");
});

//
// error handler
//

app.use((err: any, req: any, res: any, next: any) => {
  console.log("HelloExpressApp: " + err);

  res.end("HelloExpressApp: " + err); // prevent stall
});

export default app;
//
