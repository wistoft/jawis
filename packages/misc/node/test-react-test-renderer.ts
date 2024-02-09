import { ReactElement } from "react";
import RTR, { ReactTestRenderer } from "react-test-renderer";
import { createRenderer, ShallowRenderer } from "react-test-renderer/shallow";
import { format as prettyFormat, plugins } from "pretty-format";

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
 * problems
 *  - Removes `&nbsp;` entirely
 *  - Makes a newline between all children. The right thing is to just juxtapose children.
 *  - Return array, when element is React.Fragment
 *
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
