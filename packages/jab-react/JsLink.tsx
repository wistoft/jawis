import React, { memo, MouseEvent, ReactNode } from "react";

export type JsLinkProps = {
  name?: string;
  children?: ReactNode;
  onClick: (e: MouseEvent<HTMLAnchorElement>) => void;
  title?: string;
  href?: string;
  style?: React.CSSProperties;
};

/**
 * A link that execute javascript code.
 *
 * - use either name or children prop.
 */
export const JsLink: React.FC<JsLinkProps> = memo(
  ({ name, onClick, href = "#", title = "", style, children }) => (
    <a
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        onClick(e);
      }}
      href={href}
      title={title}
      style={style}
      className={"jab-js-link"}
    >
      {name}
      {children}
    </a>
  )
);

JsLink.displayName = "JsLink";
