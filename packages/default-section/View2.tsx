import React, { MouseEvent, useRef, memo } from "react";

import { useMemoDep, JsLink } from "^jab-react";
import { StateProv } from "./useStateProv";

export type Props = StateProv & {
  style?: React.CSSProperties;
  className?: string;
};

const ownStyles: React.CSSProperties = {
  background: "coral",
};

/**
 *
 */
export const View2: React.FC<Props> = memo((props) => {
  const { style, className, children, ...safeProps } = props;

  //own callbacks
  const callbacks = useMemoDep({}, createCallbacks);

  //hook created callbacks
  const onReset = props.useReset(false);

  const divRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={divRef}
      style={{ ...style, ...ownStyles }}
      className={"ownClass " + className}
    >
      <a onClick={callbacks.onClick} href="#">
        click
      </a>
      , <JsLink name="reset" onClick={onReset} />
    </div>
  );
});

//
// methods
//

type CallbackDeps = {};

const createCallbacks = (deps: CallbackDeps) => {
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {};

  return {
    onClick,
  };
};
