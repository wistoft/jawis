import React from "react";

import { Main as DevAppMain } from "^dev-appv";
import { getApiPath, JaviDirector, JaviDirectorProps } from "^javi-client";
import { Main as DevComponentPanel } from "^dev-compv";

import { devComponents } from "./devComponents";
import { Console } from "../project-released-web";

type Props = {
  serverPort: number; //mandatory in development, because server is on a different port than client.
  jagoConsolePortForDev: number;
} & Omit<JaviDirectorProps, "routes" | "postNav">;

export type DevClientConf = {
  serverPort: number;
  jagoConsolePortForDev: number;
};

/**
 *
 */
export const DevDirector: React.FC<Props> = ({
  serverPort,
  jagoConsolePortForDev,
  ...extra
}) => {
  const postNav = (
    <span style={{ color: "var(--link-color)" }}>
      , <a href="http://localhost:3000">Server</a>
    </span>
  );

  const extraRoutes = [
    {
      name: "Comps",
      elm: (
        <DevComponentPanel
          apiPath={getApiPath(serverPort, "dev-comp")}
          contexts={devComponents}
        />
      ),
    },
    {
      name: "App",
      elm: <DevAppMain apiPath={"localhost:" + serverPort + "/default"} />,
    },
  ];

  const consolePanel = (
    <Console {...extra} apiPath={getApiPath(jagoConsolePortForDev, "jago")} />
  );

  return (
    <JaviDirector
      {...extra}
      serverPort={serverPort}
      postNav={postNav}
      consolePanel={consolePanel}
      routes={extraRoutes}
    />
  );
};
