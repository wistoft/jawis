import React, { memo, useState } from "react";
import path from "path-browserify";

import { ParsedStack, basename } from "^jab";
import { JsLink } from "^jab-react";
import { OpenFile } from "^jawis-util";

type StackFrame = {
  line?: number;
  file?: string;
  func?: string;
};

//props

export type ViewExceptionCallStackProps = {
  stack?: ParsedStack;
  projectRoot: string;
  openFile: OpenFile;
  removePathPrefix?: string; //relative to projectRoot
  initialShowSystemFrames?: boolean;
};

/**
 * Present a stack.
 *
 * - projectRoot is used to know where webpack is servered from, so we can resolve `webpack://` and `webpack-internal://`
 * - projectRoot is used to resolve `removePathPrefix`, which is relative to projectRoot.
 */
export const ViewExceptionCallStack: React.FC<ViewExceptionCallStackProps> = memo(
  ({
    stack,
    projectRoot,
    openFile,
    removePathPrefix,
    initialShowSystemFrames,
  }) => {
    const [showSystemFrames, setShowSystemFrames] = useState(
      initialShowSystemFrames || false
    );

    if (!stack) {
      return null;
    }

    //make sure it ends on a slash.
    const normalizedProjectRoot = normalize(projectRoot);

    const normalizedRemovePathPrefix = removePathPrefix
      ? normalize(removePathPrefix)
      : "";

    return (
      <>
        {stack.map(
          mapFrame(
            openFile,
            showSystemFrames,
            setShowSystemFrames,
            normalizedProjectRoot,
            normalizedRemovePathPrefix
          )
        )}
        <div />
      </>
    );
  }
);

ViewExceptionCallStack.displayName = "ViewExceptionCallStack";

//
// util
//

const mapFrame = (
  openFile: OpenFile,
  showSystemFrames: boolean,
  setShowSystemFrames: any,
  normalizedProjectRoot: string,
  normalizedRemovePathPrefix: string
  // eslint-disable-next-line react/display-name
) => (frame: StackFrame, index: number) => {
  const isSystemFrame = getIsSystemFrame(frame);

  if (!showSystemFrames && isSystemFrame) {
    return (
      <JsLink
        key={index}
        onClick={() => {
          setShowSystemFrames(!showSystemFrames);
        }}
        style={{ color: "var(--text-color-faded)" }}
      >
        .
      </JsLink>
    );
  }

  const color = isSystemFrame
    ? "var(--text-color-faded)"
    : "var(--jawis-console-text-color)";

  //make file relative and trim and remove prefix

  const file = getFile(
    normalizedProjectRoot,
    normalizedRemovePathPrefix,
    frame.file
  );

  //split file path up.

  const { firstDir, filepath, filename } = partitionFile(file);

  //render file and line

  const showLineNumber = false; //extract.

  const fileAndLine =
    file === undefined && frame.line === undefined ? (
      <>&nbsp;&nbsp;...</>
    ) : (
      <>
        &nbsp;&nbsp;
        {isSystemFrame ? (
          <i>
            <b>{firstDir}</b>
          </i>
        ) : (
          firstDir
        )}
        {filepath}
        <span style={{ color }}>{filename}</span>
        {showLineNumber && frame.line && " (" + frame.line + ")"}
      </>
    );

  //render function name

  const func = getFunc(frame);

  // for opening files

  const absFile = getAbsFile(normalizedProjectRoot, frame.file);

  return (
    <React.Fragment key={index}>
      <div style={{ marginTop: "5px" }} />
      <JsLink
        style={{ color: "var(--text-color-faded)" }}
        onClick={() => {
          if (absFile) {
            openFile({ file: absFile, line: frame.line });
          }
        }}
      >
        {func}
        <br />
        {fileAndLine}
      </JsLink>
      <div />
    </React.Fragment>
  );
};

/**
 *
 */
const getIsSystemFrame = (frame: StackFrame) =>
  frame.file?.startsWith("internal") ||
  frame.file === "events.js" ||
  frame.file === "webpack:///webpack/bootstrap" ||
  frame.file?.includes("node_modules") ||
  (frame.func && frame.func === "__webpack_require__") ||
  frame.file?.indexOf("build-alpha") !== -1; //hacky. This should be custom setting only for jawis repo.

/**
 *
 */
export const getFile = (
  normalizedProjectRoot: string,
  normalizedRemovePathPrefix: string,
  file: string | undefined
) => {
  if (!file) {
    return;
  }

  let partial: string;

  if (/^webpack(-internal)?:\/\/\//.test(file)) {
    //it's client side

    partial = file
      .replace("webpack-internal:///", "")
      .replace("webpack:///", "")
      .replace(/^\.\//, "")
      .replace(normalizedRemovePathPrefix, "");
  } else {
    //it's server side

    partial = file
      .replace(/\\/g, "/")
      .replace(normalizedProjectRoot + normalizedRemovePathPrefix, "");
  }

  return partial.replace(/^.*node_modules\//, ""); //remove entirely, first folder will be highlighted.
};

/**
 *
 */
export const getFunc = (frame: StackFrame) => {
  if (!frame.func) {
    return "ano";
  }

  //the func for the app entry script is the file path. Let's just use the basename for func. The file has the file path.
  if (frame.file?.replace("webpack://", ".") === frame.func) {
    return basename(frame.func);
  }

  return frame.func
    .replace(/.*__webpack_exports__\./, "")
    .replace(/^Object\.exports\./, "")
    .replace(/^Object\.<anonymous>$/, "ano")
    .replace(/^.* \[as (.*)\]$/, "$1");
};

/**
 *
 * - expects relative paths to have no prefix like: './'
 * - expects forward slashes, only.
 * - firstDir is only extracted for relative paths.
 *
 * bug/quick fix
 *  - we use ':' to detect absolute file path on windows, but that will fail on linux, if a folder has colon in it.
 */
export const partitionFile = (file?: string) => {
  const filename = basename(file || "");
  const fullFilepath = file?.replace(filename, "") || "";

  const match = fullFilepath.match(/^([^/:]*)\//); // match all before the first slash. And disallow colon.

  if (match) {
    const firstDir = match[1];
    const filepath = fullFilepath.replace(firstDir, "");

    return { firstDir, filepath, filename };
  }

  return { firstDir: "", filepath: fullFilepath, filename };
};

/**
 *
 */
export const getAbsFile = (projectRoot: string, file?: string) => {
  if (!file) {
    return undefined;
  }

  const relPath = file
    .replace("webpack://", "")
    .replace("webpack-internal://", "");

  if (file !== relPath) {
    //make absolute, if there was a webpack protocol.
    return path.join(projectRoot, relPath).replace(/\\/g, "/");
  } else {
    return file;
  }
};

/**
 *
 * - separators are turned into slashes.
 * - ends with slash.
 */
export const normalize = (path: string) => {
  const tmp = path.replace(/\\/g, "/");

  if (tmp.endsWith("/")) {
    return tmp;
  } else {
    return tmp + "/";
  }
};
