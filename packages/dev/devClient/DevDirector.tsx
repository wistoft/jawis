import React, { useState } from "react";

// eslint-disable-next-line import/no-extraneous-dependencies
import { makeUseConsoleStream } from "@wistoft/jadev-console";
// eslint-disable-next-line import/no-extraneous-dependencies
import { ConsoleMain } from "@wistoft/jagov/console/ConsoleMain";

import { Director } from "^default-section";
import { JaviDirector, JaviDirectorProps } from "^javi/client";
import { getApiPath } from "^jawis-util";

import { DevComponents } from "./DevComponents";

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
  const [useConsoleStream] = useState(makeUseConsoleStream);

  const postNav = (
    <span style={{ color: "var(--link-color)" }}>
      , <a href="http://localhost:3001">Server</a>
    </span>
  );

  const extraRoutes = [
    {
      name: "Comps",
      elm: <DevComponents />,
    },
    {
      name: "Default",
      elm: <Director apiPath={"localhost:" + serverPort + "/default"} />,
    },
  ];

  const consolePanel = (
    <ConsoleMain
      {...extra}
      useConsoleStream={useConsoleStream}
      apiPath={getApiPath(jagoConsolePortForDev, "jago")}
    />
  );

  return (
    <JaviDirector
      {...extra}
      serverPort={serverPort}
      consolePanel={consolePanel}
      postNav={postNav}
      routes={extraRoutes}
      showDtpLink={true}
    />
  );
};
