import React, { useState } from "react";
import { makeUseConsoleStream } from "@jawis/console";
import { Console } from "^jagov";

export const MyConsole: React.FC = () => {
  const [useConsoleStream] = useState(makeUseConsoleStream);

  return (
    <Console
      //use the data captured in the browser.
      useConsoleStream={useConsoleStream}
      //get console output on the server.
      apiPath={"localhost:3001/jago"}
      projectRoot={""}
    />
  );
};
