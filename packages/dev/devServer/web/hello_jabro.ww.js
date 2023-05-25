try {
  console.log("hej");
  // throw new Error("ups");
} catch (error) {
  globalThis.QUICK_FIX = error;
}
