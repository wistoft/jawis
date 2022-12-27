import React, { memo } from "react";

import { ComponentDef } from "./Main";

import { FunkyComponent } from "./util";

export type ViewComponentProps = ComponentDef;

/**
 *
 */
export const ViewComponent: React.FC<ViewComponentProps> = memo(
  (props: ComponentDef) => {
    if (props.path.endsWith(".tsx")) {
      //it's an ordinary component.
      const Comp = props.comp as React.ComponentType<unknown>;

      return <Comp />;
    } else {
      //it's an function, and needs to be wrapped.
      return <FunkyComponent func={props.comp} />;
    }
  }
);
