import React from "react";
import {
  createMemorySource,
  createHistory,
  LocationProvider,
} from "@reach/router";

import { ComponentMenu, ComponentMenuProps } from "^jab-react";
import {
  ViewException,
  ViewExceptionCallStack,
  ViewExceptionCallStackProps,
  ViewExceptionProps,
} from "^view-exception";
import { parseErrorData } from "^parse-captured-stack";
import {
  InnerPanel,
  Props as DevComponentPanelProps,
} from "^dev-compv/InnerPanel";

import { errorData0 } from ".";

/**
 *
 */
export const getDevComponentPanel = (
  props?: Partial<DevComponentPanelProps>,
  location = "/"
) => (
  <LocationProvider history={createHistory(createMemorySource(location))}>
    <InnerPanel
      folders={[]}
      {...props}
      openComponnent={() => {}}
      useKeyListener={() => {}}
    />
  </LocationProvider>
);

/**
 *
 */
export const getComponentMenu = (
  props?: Partial<ComponentMenuProps>,
  location = "/"
) => (
  <LocationProvider history={createHistory(createMemorySource(location))}>
    <ComponentMenu routes={[]} {...props} />
  </LocationProvider>
);

/**
 *
 */
export const getViewException = (props: Partial<ViewExceptionProps>) => (
  <ViewException
    errorData={parseErrorData(errorData0)}
    projectRoot={"C:\\"}
    onToggleEntry={() => {}}
    openFile={() => {}}
    {...props}
  />
);

/**
 *
 */
export const getViewExceptionCallStack = (
  props: Partial<ViewExceptionCallStackProps>
) => (
  <ViewExceptionCallStack
    projectRoot={"C:"}
    removePathPrefix={"packages"}
    openFile={() => {}}
    stack={[]}
    {...props}
  />
);
