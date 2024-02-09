import { ReactElement } from "react";
import prettier from "prettier";
import { renderToStaticMarkup } from "react-dom/server";

/**
 * notes
 *  - renderToStaticMarkup is the best solution. In that it has the least problems.
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
