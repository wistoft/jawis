import { ReactElement } from "react";
import RTR, { ReactTestRenderer } from "react-test-renderer";
import { createRenderer, ShallowRenderer } from "react-test-renderer/shallow";
import prettyFormat from "pretty-format";

/**
 *
 */
export const rendererTos = (renderer: ReactTestRenderer) =>
  prettyFormat(renderer.toJSON(), {
    plugins: [prettyFormat.plugins.ReactTestComponent],
    printFunctionName: false,
  });

/**
 *
 */
export const shallowRendererTos = (renderer: ShallowRenderer) =>
  prettyFormat(renderer.getRenderOutput(), {
    plugins: [prettyFormat.plugins.ReactElement],
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
