import { PluginConstructor } from "./internal";

const regexs = [
  /[^\n\/](\n\/\/)+(?=\s*$)/,
  /\r/g,
  // /( |\f|\r|\t|\v)+(?=\n)/g, //can be a problem, it's not sensitive to code structure.
];

/**
 *
 */
export const trimCommentPlugin: PluginConstructor = () => ({
  includeFile: (file) =>
    file.endsWith(".ts") ||
    file.endsWith(".tsx") ||
    file.endsWith(".js") ||
    file.endsWith(".jsx"),
  mapFile: (content) => {
    let res = content;

    for (const regex of regexs) {
      res = res.replace(regex, "");
    }

    return res;
  },
});
