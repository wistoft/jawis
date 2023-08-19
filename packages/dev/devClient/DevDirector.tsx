import React, { useState } from "react";

// eslint-disable-next-line import/no-extraneous-dependencies
import { makeUseConsoleStream } from "@jawis/console";
// eslint-disable-next-line import/no-extraneous-dependencies
import { ConsoleMain } from "@jawis/jagov/console/ConsoleMain";

import { JaviDirector, JaviDirectorProps } from "^javi-client";
import { Main as DevComponentPanel } from "^dev-compv";
import { devComponents } from "./devComponents";
import { getApiPath } from "^javi-client/util";
import { useJabroHive } from "^jabrov";

type Props = {
  serverPort: number; //mandatory in development, because server is on a different port than client.
  jagoConsolePortForDev: number;
} & Omit<JaviDirectorProps, "routes" | "postNav">;

/**
 *
 */
export const DevDirector: React.FC<Props> = ({
  serverPort,
  jagoConsolePortForDev,
  ...extra
}) => {
  useJabroHive(getApiPath(serverPort, "jabro"));

  // const [useConsoleStream] = useState(makeUseConsoleStream);

  const postNav = (
    <span style={{ color: "var(--link-color)" }}>
      , <a href="http://localhost:3001">Server</a>
    </span>
  );

  const extraRoutes = [
    {
      name: "Comps",
      elm: (
        <DevComponentPanel
          apiPath={getApiPath(jagoConsolePortForDev, "jago")}
          contexts={devComponents}
        />
      ),
    },
  ];

  // const consolePanel = (
  //   <ConsoleMain
  //     {...extra}
  //     useConsoleStream={useConsoleStream}
  //     apiPath={getApiPath(jagoConsolePortForDev, "jago")}
  //   />
  // );

  return (
    <JaviDirector
      {...extra}
      serverPort={serverPort}
      postNav={postNav}
      consolePanel={<>console must support react 17</>}
      routes={extraRoutes}
    />
  );
};
