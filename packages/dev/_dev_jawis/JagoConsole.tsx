import React, { useState } from "react";

import { JsLink } from "^jab-react";
import { consoleCapture, makeUseConsoleStream } from "^console";
import { ConsoleMain } from "^jagov/console/ConsoleMain";

/**
 * note
 *  - this kinda accidentally works. Even though useState is called several times.
 *  - the capture isn't "unregistered" on unmount. It's fragile with global
 *      , and unregister can be hard to implement. And kinda unneeded. Because
 *      no one can see, that several development captures are working, because
 *      only the last has a global variable, that `makeUseConsoleStream` can connect to.
 */
export const JagoConsole: React.FC = () => {
  const [useConsoleStream] = useState(() => {
    //hacky to mount things here. But state depends on them.

    //use other property. To be able to have live and development capture side-by-side.

    const windowProperty = "__JawisConsoleCapture__development";

    // activate the development version of capture.

    consoleCapture(windowProperty);

    //the actual state.

    return makeUseConsoleStream(windowProperty);
  });

  return (
    <>
      <JsLink
        name="log"
        onClick={() => {
          console.log("some log message");
        }}
      />
      ,{" "}
      <JsLink
        name="throw"
        onClick={() => {
          throw new Error("ups");
        }}
      />
      <i> - note: live console disabled</i>
      <br />
      <br />
      <br />
      <ConsoleMain
        useConsoleStream={useConsoleStream}
        apiPath={"localhost:3001/jago"}
        projectRoot={"E:\\work\\repos\\jawis\\"}
        removePathPrefix={""}
        initialShowSystemFrames={false}
      />
    </>
  );
};
