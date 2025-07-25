import React, { memo } from "react";

import { FunkyComponent, ComponentDef } from "./internal";

export type ViewComponentProps = ComponentDef & {
  useProvision: (path: string) => any;
};

/**
 *
 */
export const ViewComponent: React.FC<ViewComponentProps> = memo((props) => {
  const prov = props.useProvision(props.path);

  if (props.path.endsWith(".tsx")) {
    //it's an ordinary component.
    const Comp = props.comp as any;

    return <Comp {...prov} />;
  } else {
    //it's an function, and needs to be wrapped.
    return <FunkyComponent func={props.comp} />;
  }
});

ViewComponent.displayName = "ViewComponent";
