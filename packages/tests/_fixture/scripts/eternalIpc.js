console.log("Argh, Sisyphus");

process.on("message", () => {
  console.log("I won't die!");
});

let i = 0;
setInterval(() => {
  i++;
  console.log("eternalIpc.js", i);
}, 1000);
