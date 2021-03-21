export const spin = (time: number) => {
  const start = Date.now();

  let i = 0;

  while (Date.now() - start < time) {
    i += 1 / 2;

    if (i < 0) {
      console.log("unreach");
    }
  }
};
