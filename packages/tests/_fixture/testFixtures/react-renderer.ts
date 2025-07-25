import { ReactElement } from "react";
import RTR, { ReactTestRenderer } from "react-test-renderer";
import { createRenderer, ShallowRenderer } from "react-test-renderer/shallow";
import { format as prettyFormat, plugins } from "pretty-format";
import prettier from "prettier";
import { renderToStaticMarkup } from "react-dom/server";

/**
 * notes
 *  - renderToStaticMarkup is the best solution. It has the least problems.
 *  - It might be possible to fix problems with RTR, by travering react json. But
 *      would also be work.
 */
export const getHtml = (elm: ReactElement<any>) => {
  //Best solution
  //problems
  // - Emits warning about: useLayoutEffect
  // - Removes `&nbsp;` entirely
  return renderToStaticMarkup(elm);

  // return getHtml_TestingLibrary(elm);
  // return getHtmlRTR(elm);
};

/**
 *
 */
export const getPrettyHtml = (elm: ReactElement<any>) =>
  prettier.format(getHtml(elm) ?? "", { parser: "html" });

/**
 *
 */
export const rendererTos = (renderer: ReactTestRenderer) =>
  prettyFormat(renderer.toJSON(), {
    plugins: [plugins.ReactTestComponent],
    printFunctionName: false,
  });

/**
 *
 */
export const shallowRendererTos = (renderer: ShallowRenderer) =>
  prettyFormat(renderer.getRenderOutput(), {
    plugins: [plugins.ReactElement],
    printFunctionName: false,
  });

/**
 *
 */
export const getHtmlRTR = (elm: ReactElement) => rendererTos(RTR.create(elm));

/**
 *
 */
export const getShallowHtmlRTR = (elm: ReactElement) => {
  const renderer = createRenderer();
  renderer.render(elm);
  return shallowRendererTos(renderer);
};
