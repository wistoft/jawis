import fs from "fs";
import path from "path";
import {
  assertGitClean,
  execNpmAndGetStdout,
  fixatePackageJsonMapper,
  updatePackageJson,
} from "./util/index";

import { looping } from "^yapu/yapu";
import { getLiveBuildVersionInfo } from "./build/util3";
import { allPackagesIncludingPrivate, projectRoot } from "^dev/project.conf";
import { objMap, tos } from "^jab";

type Epoch = {
  id: number;
  modeEpoch: "exact" | "relative";
  modeRest: "exact" | "relative";
  versions: { [_: string]: string };
};

const epochs: Epoch[] = [
  {
    id: 0,
    modeEpoch: "relative",
    modeRest: "relative",
    versions: {
      react: "16.14.0",
      "@types/react": "16.8.0",
      "react-dom": "16.14.0",
      "@types/react-dom": "16.8.0",
      "react-test-renderer": "16.14.0",
      "@types/react-test-renderer": "16.9.5",
    },
  },
  {
    id: 1,
    modeEpoch: "exact",
    modeRest: "relative",
    versions: {
      react: "17.0.0",
      "@types/react": "17.0.0",
      "react-dom": "17.0.0",
      "@types/react-dom": "17.0.0",
      "react-test-renderer": "17.0.0",
      "@types/react-test-renderer": "17.0.0",
    },
  },
  {
    //some problem with jsx rendering, but types and stuff works.
    id: 2,
    modeEpoch: "exact",
    modeRest: "relative",
    versions: {
      react: "18.0.0",
      "@types/react": "18.0.0",
      "react-dom": "18.0.0",
      "@types/react-dom": "18.0.0",
      "react-test-renderer": "18.0.0",
      "@types/react-test-renderer": "18.0.0",
    },
  },
];

/**
 *
 */
export const doit = async () => {
  //config
  const epochId: number = 0;
  const earliest = false;

  //state
  let epoch: Epoch;
  let postfix = "";
  let updateRoot = true;

  switch (epochId) {
    case 0:
      epoch = epochs[0];
      if (earliest) {
        //yarn test possible
        //yarn javi not possible without : `"resolutions": { "express": "4.8.0" }`
        postfix = ".earliest";
        updateRoot = false;
        epoch.modeEpoch = "exact";
        epoch.modeRest = "exact";
      }
      break;

    default:
      epoch = epochs[epochId];
      break;
  }

  await assertGitClean(projectRoot);

  await fs.promises.copyFile(
    path.join(projectRoot, "yarn.epoch." + epoch.id + postfix + ".lock"),
    path.join(projectRoot, "yarn.lock")
  );

  //remove ^ from all package dependencies

  updatePackageJson({ map: packageJsonMapper(epoch), updateRoot });
};

/**
 *
 */
export const packageJsonMapper = (epoch: Epoch) =>
  fixatePackageJsonMapper("exact", (key, value) => {
    const epochVersion = (epoch.versions as any)[key];

    if (epochVersion !== undefined) {
      const prefix = epoch.modeEpoch === "exact" ? "" : "^";
      return prefix + epochVersion; //there was an epoch version
    }

    switch (epoch.modeRest) {
      case "exact":
        return value;

      case "relative":
        return "^" + value;

      default:
        throw new Error("Unknown mode: " + epoch.modeRest);
    }
  });

doit();
