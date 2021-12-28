import { ReactElement } from "react";
import enzyme, { render, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import toJson from "enzyme-to-json";
import prettyFormat from "pretty-format";

let loaded = false;

/**
 * Lazy, to avoid side-effects at module load.
 */
const ensureLoaded = () => {
  if (!loaded) {
    enzyme.configure({ adapter: new Adapter() });
    loaded = true;
  }
};

/**
 *
 */
export const cheerioTos = (cheerio: any) =>
  prettyFormat(toJson(cheerio, { noKey: true }), {
    plugins: [prettyFormat.plugins.ReactTestComponent],
    printFunctionName: false,
  });

/**
 *
 */
export const getHtmlEnzyme = (elm: ReactElement) => {
  ensureLoaded();

  return cheerioTos(render(elm));
};

/**
 *
 */
export const getShallowHtmlEnzyme = (elm: ReactElement) => {
  ensureLoaded();

  return cheerioTos(shallow(elm));
};
