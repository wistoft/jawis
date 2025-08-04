import { specifierToNpmPackage } from "^dev/scripts/build";
import { TestProvision } from "^jarun";

export default async (prov: TestProvision) => {
  prov.eq("fs", specifierToNpmPackage("fs"));
  prov.eq("node:fs", specifierToNpmPackage("node:fs"));
  prov.eq("@babel/parser", specifierToNpmPackage("@babel/parser"));
  prov.eq("^first-library", specifierToNpmPackage("^first-library"));

  // one path segment

  prov.eq("fs", specifierToNpmPackage("fs/index.js"));
  prov.eq("node:fs", specifierToNpmPackage("node:fs/index.js"));
  prov.eq("@babel/parser", specifierToNpmPackage("@babel/parser/index.js"));
  prov.eq("^first-library", specifierToNpmPackage("^first-library/index.js"));

  // two path segments

  prov.eq("fs", specifierToNpmPackage("fs/sub-folder/index.js")); // prettier-ignore
  prov.eq("node:fs", specifierToNpmPackage("node:fs/sub-folder/index.js")); // prettier-ignore
  prov.eq("@babel/parser", specifierToNpmPackage("@babel/parser/sub-folder/index.js")); // prettier-ignore
  prov.eq("^first-library", specifierToNpmPackage("^first-library/sub-folder/index.js")); // prettier-ignore
};
