import "./style.css";

import React, { memo } from "react";
import { Link, Router } from "@reach/router";

import { ComponentMenu, NoRoute, ReachRoute } from "^jab-react";

import { View1, Props as View1Props } from "./View1";
import { View2, Props as View2Props } from "./View2";
import { ViewHome, Props as ViewPoisonProps } from "./ViewHome";

//props

type OwnProps = {};

export type Props = OwnProps & View1Props & View2Props & ViewPoisonProps;

const ownStyles: React.CSSProperties = {};

/**
 *
 */
export const View: React.FC<Props> = memo((props) => (
  <div style={ownStyles}>
    <ComponentMenu
      routes={[
        {
          name: "Home",
          elm: <ViewHome {...props} />,
        },
        {
          name: "first",
          elm: <View1 />,
        },
        {
          name: "second",
          elm: <View2 {...props} />,
        },
      ]}
    />
  </div>
));

View.displayName = "View";
