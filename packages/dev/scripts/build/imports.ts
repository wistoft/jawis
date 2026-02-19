/**
 *
 */
export const specifierToNpmPackage = (specifier: string) => {
  if (specifier.startsWith("@")) {
    return specifier.replace(/(^@[^/]+\/[^/]+).*$/, "$1");
  } else {
    return specifier.replace(/(^[^/]+).*$/, "$1");
  }
};
