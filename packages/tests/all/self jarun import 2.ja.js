// js-files can be ESM without need for transpiling

export default (prov) => {
  if (typeof import.meta.filename !== "string") {
    throw new Error("import.meta.filename should be set.");
  }
};
