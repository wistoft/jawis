import { ReactElement } from "react";
import enzyme, { render, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import toJson from "enzyme-to-json";
import { format as prettyFormat, plugins } from "pretty-format";

//not that nice with side effects
enzyme.configure({ adapter: new Adapter() });

/**
 *
 */
export const cheerioTos = (cheerio: any) =>
  prettyFormat(toJson(cheerio, { noKey: true }), {
    plugins: [plugins.ReactTestComponent],
    printFunctionName: false,
  });

/**
 *
 */
export const getHtmlEnzyme = (elm: ReactElement) => cheerioTos(render(elm));

/**
 *
 */
export const getShallowHtmlEnzyme = (elm: ReactElement) =>
  cheerioTos(shallow(elm));
