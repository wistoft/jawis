//line numbers in this file is important for test case.

//listener

process.on("uncaughtException", (error: any) => {
  //removes all files in jawis codebase, because they change too often.
  // except this file.

  console.log(
    error.__jawisNodeStack.filter(
      (elm: any) =>
        elm.file.includes("jacs_make") || !elm.file.includes("jawis\\packages")
    )
  );
});

//just to take up line numbers. For testing source map.

export type fido = {
  a: 1;
  q: 1;
  w: 1;
};

throw new Error("you asked for it.");
