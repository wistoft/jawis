import "./style.css";

import React from "react";
import { BrowserRouter } from "react-router-dom";

import {
  ErrorBoundary,
  useObject,
  ComponentMenu,
  IsFirstRouteEffectProvider,
  RouteDef,
} from "^jab-react";
import { Main as JatevMain, Props as JatevProps } from "^jatev";
import { Main as JagovMain, Props as JagovProps } from "^jagov";
import { useJabroHive } from "^jabrov";

import {
  JaviTemplate,
  getApiPath,
  JaviDirectorProps,
  ClientRoute,
} from "./internal";

/**
 *
 * - server port is default: 80.
 * - this caters for both production and dev sites. (to avoid code duplication.)
 */
export const JaviDirector: React.FC<JaviDirectorProps> = ({
  siteTitle,
  clientRoutes,
  serverPort,
  consolePanel,
  postNav,
  routes,
  ...extra
}) => {
  if (siteTitle) {
    document.title = siteTitle;
  }

  //todo
  // no need to be a hook. If it can unload itself.
  // it must be decoupled from javi, so must have its own compiled entry.
  //  - it could be completely standalone.
  //  - it could use a javi ws service. But then it's tied to javi for no obvious reason.
  useJabroHive(getApiPath(serverPort, "jabro"));

  //decouple: needs to compile its own component
  const jatevProps: JatevProps = useObject({
    ...extra,
    apiPath: getApiPath(serverPort, "jate"),
  });

  //also decouple
  const jagovProps: JagovProps = useObject({
    ...extra,
    apiPath: getApiPath(serverPort, "jago"),
  });

  //client routes

  //todo
  //  useState
  //  file must export a module or set global
  //  load component lazy on route mount
  const realClientRoutes: RouteDef[] = clientRoutes.map((def) => ({
    name: def.name,
    elm: <ClientRoute {...def}></ClientRoute>,
  }));

  return (
    <ErrorBoundary renderOnError={"Javi failed"}>
      <JaviTemplate
        mainPanel={
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <IsFirstRouteEffectProvider>
              <ComponentMenu
                postNav={postNav}
                routes={[
                  ...realClientRoutes,
                  { name: "Tests", elm: <JatevMain {...jatevProps} /> },
                  { name: "Scripts", elm: <JagovMain {...jagovProps} /> },
                  ...(routes || []),
                ]}
              />
            </IsFirstRouteEffectProvider>
          </BrowserRouter>
        }
        consolePanel={consolePanel}
      />
    </ErrorBoundary>
  );
};
