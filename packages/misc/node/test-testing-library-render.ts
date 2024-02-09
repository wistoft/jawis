// import { ReactElement } from "react";
// import { render } from "@testing-library/react";
// import { JSDOM } from "jsdom";

/**
 * problems
 *  - it's not proper to change window. Tests can break because of it.
 *  - Some style properties are removed from the output.
 *  - It adds `&nbsp;` as well as a space
 *  - jsdom has retrictions on node version.
 *
 * - Will not prettify html, so this can be used where whitespace is importance.
 *
 */
// export const getHtml_TestingLibrary = (elm: ReactElement<any>) => {
// const hadWindow = "window" in global;
// const orgWindow = global.window;
// const dom = new JSDOM("");
// (global as any).window = dom.window;
// //not mounted. Maybe it should.
// const container = dom.window.document.createElement("div");
// render(elm, {
//   container,
// });
// if (hadWindow) {
//   (global as any).window = orgWindow;
// } else {
//   delete (global as any).window;
// }
// return container.innerHTML;
// };
