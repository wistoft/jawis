import { makeLiveJawisBuildManager } from "./build";

export const main = async () => {
  await makeLiveJawisBuildManager().checkPackages();
};
