import React, { MouseEvent, ReactNode } from "react";

import { useMemoDep } from ".";

type Props = {
  onClick: (e: MouseEvent<HTMLDivElement>) => void;
  style?: React.CSSProperties;
  className?: string;
  children: ReactNode;
};

/**
 * Make the 'div' background clickable.
 *
 * - Only meant for inline children.
 */
export const ClickableDivBackground: React.FC<Props> = ({
  onClick,
  style,
  children,
  className,
}) => {
  const callbacks = useMemoDep({ onClick }, createCallbacks);

  return (
    <div
      {...callbacks}
      style={{
        ...style,
        cursor: "pointer",
      }}
      className={className}
    >
      <span style={{ cursor: "auto" }}>{children}</span>
    </div>
  );
};

type ClickGuardDeps = {
  onClick: (e: MouseEvent<HTMLDivElement>) => void;
  allowChildTarget?: boolean;
  allowDrag?: boolean;
  minimumDistance?: number;
};

/**
 * extract as click guard.
 */
const createCallbacks = ({
  onClick: depsOnClick,
  allowChildTarget = false,
  allowDrag = false,
  minimumDistance = 5,
}: ClickGuardDeps) => {
  let startX: number;
  let startY: number;
  let dragged: boolean;

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>): void => {
    startX = e.pageX;
    startY = e.pageY;
    dragged = false;
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>): void => {
    // let's stay in Manhatten.
    if (
      Math.abs(startX - e.pageX) > minimumDistance ||
      Math.abs(startY - e.pageY) > minimumDistance
    ) {
      dragged = true;
    }
  };

  /**
   * note: currentTarget will always be the element, this listener is attached to.
   */
  const onClick = (e: React.MouseEvent<HTMLDivElement> | any) => {
    if (dragged && !allowDrag) {
      return;
    }
    if (e.target !== e.currentTarget && !allowChildTarget) {
      return;
    }
    depsOnClick(e);
  };

  return { onMouseDown, onMouseMove, onClick };
};
