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
import { objMap, toInt, tos } from "^jab";

type Epoch = {
  id: number;
  modeEpoch: "exact" | "relative";
  modeRest: "exact" | "relative";
  versions: { [_: string]: string };
};

const epochs: Epoch[] = [
  {
    id: 99,
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
    id: 0,
    modeEpoch: "exact",
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
  // const epochId: number = 0;
  const epochId: number = toInt(process.argv[2]);
  const skipCleanRepoCheck: boolean = process.argv.some(
    (arg) => arg === "--skip-clean-repo-check"
  );

  //validate

  validateEpochs(epochs);

  //state
  const epoch = epochs.find((epoch) => epoch.id === epochId);
  let postfix = "";
  let updateRoot = true;

  if (epoch === undefined) {
    throw new Error("Did not find epoch: " + epochId + ". Available: " + (epochs.map(elm => (elm.id)))); // prettier-ignore
  }

  if (skipCleanRepoCheck) {
    console.log("Skipping clean repo check");
  } else {
    await assertGitClean(projectRoot);
  }

  if (epoch.id !== 99) {
    await fs.promises.copyFile(
      path.join(projectRoot, "yarn.epoch." + epoch.id + postfix + ".lock"),
      path.join(projectRoot, "yarn.lock")
    );
  }

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

export const validateEpochs = (epochs: Epoch[]) => {
  let errors = false;

  for (const epoch of epochs) {
    for (const [packageName, version] of Object.entries(epoch.versions)) {
      if (!version.match(/^\d+\.\d+\.\d+$/)) {
        console.log(
          "Version in in valid for package: " + packageName + ":" + version
        );

        errors = true;
      }
    }
  }

  if (errors) {
    throw new Error("Epochs wasn't valid");
  }
};

doit();
