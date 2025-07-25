//line numbers in this file is important for test case.

//listener

process.on("uncaughtException", (error: any) => {
  //removes all files in jawis codebase, except this file.
  //  Because they change too often.

  for (const val of error.__jawisNodeStack) {
    if (val.file?.includes("jacs_make.ts")) {
      console.log("Error was thrown at line: ", val.line);
    }
  }
});

//throw

throw new Error("you asked for it.");
