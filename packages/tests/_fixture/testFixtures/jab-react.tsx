import React from "react";
import { MemoryRouter } from "react-router-dom";

import { ComponentMenu, ComponentMenuProps } from "^jab-react";
import {
  ViewException,
  ViewExceptionCallStack,
  ViewExceptionCallStackProps,
  ViewExceptionProps,
} from "^view-exception";
import { parseErrorData } from "^parse-captured-stack";
import { View, ViewProps as DevComponentPanelProps } from "^dev-compv/internal";

import { errorData0 } from ".";

/**
 *
 */
export const getDevComponentPanel = (
  props?: Partial<DevComponentPanelProps>,
  location = "/"
) => (
  <MemoryRouter initialEntries={[location]}>
    <View
      folders={[]}
      {...props}
      openComponnent={() => {}}
      useKeyListener={() => {}}
    />
  </MemoryRouter>
);

/**
 *
 */
export const getComponentMenu = (
  props?: Partial<ComponentMenuProps>,
  location = "/"
) => (
  <MemoryRouter initialEntries={[location]}>
    <ComponentMenu routes={[]} {...props} />
  </MemoryRouter>
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
