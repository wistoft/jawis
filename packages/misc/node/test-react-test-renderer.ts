import { ReactElement } from "react";
import RTR, { ReactTestRenderer } from "react-test-renderer";
import { createRenderer, ShallowRenderer } from "react-test-renderer/shallow";
import { format as prettyFormat, plugins } from "pretty-format";

//in own folder, because 'react-test-renderer' is not possible to tree shake in webpack build.

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
export const getHtmlRTR = (elm: ReactElement<any>) =>
  rendererTos(RTR.create(elm));

/**
 *
 */
export const getShallowHtmlRTR = (elm: ReactElement<any>) => {
  const renderer = createRenderer();
  renderer.render(elm);
  return shallowRendererTos(renderer);
};
