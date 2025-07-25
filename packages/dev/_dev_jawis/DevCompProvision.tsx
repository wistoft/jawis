import React from "react";
import { ComponentProvMap } from "^dev-compc";

type Props = ComponentProvMap<{ fido: typeof fido }>;

/**
 *
 */
export const Component: React.FC<Props> = (props: Props) => {
  const val = props.useInvoke("fido", "ping");

  return <>{val}</>;
};

/**
 *
 */
export const fido = (msg: string) => {
  return msg + " pong";
};
