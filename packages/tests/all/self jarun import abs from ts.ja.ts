import path from "path";

export default async () => {
  const file = path.resolve("packages/tests/_fixture/projectEsm/library3.mjs"); // To avoid typescript code.
  const { saySomething } = await import("file://" + file);
  saySomething();
};
