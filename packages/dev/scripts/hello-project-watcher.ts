import path from "node:path";
import {
  startProjectWatcher as startLintManager,
  trimCommentPlugin,
} from "^jabu";
import { packageFolder, projectRoot } from "^dev/project.conf";
import { assertAbsolute } from "^jab-node";
import { AbsoluteFile } from "^jabc";

export const main = async () => {
  startLintManager({
    rootFolder: path.join(packageFolder, "jab") as AbsoluteFile,
    watch: true,
    finally: () => {},
    onError: console.log,
    log: () => {
      //ignored
      // console.log(data);
    },
    plugins: [
      trimCommentPlugin,
      // (prov) =>
      //   new TsPlugin({
      //     projectFilesystem: prov.projectFileSystem,
      //     folder: path.join(packageFolder, "jab"),
      //   }),
      // () => ({
      //   getFiles: () => [path.join(projectRoot, "tmp.txt")],
      //   mapFile: (content) => content.replace(/a/g, "."),
      // }),
      // () => ({
      //   getFiles: () => [path.join(projectRoot, "tmp.txt")],
      //   getDiagnostics: (content) => {
      //     const pos = content.indexOf("hej");
      //     if (pos !== -1) {
      //       return [{ message: "dav", line: 1, column: pos + 1 }];
      //     } else {
      //       return [];
      //     }
      //   },
      // }),
    ],
  });
};

//run if not run by bee-manager

if (!(global as any)._jawis_bee_prov) {
  main();
}
