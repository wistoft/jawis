const start = Date.now();

let i = 0;

while (Date.now() - start < 120000) {
  i += 1 / 2;

  if (i < 0) {
    console.log("unreach");
  }
}
