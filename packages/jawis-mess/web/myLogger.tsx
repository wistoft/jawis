import React, { useEffect, useState } from "react";
import { shallowEqualObjects } from "shallow-equal";
import { getDiffAsString } from "^jawis-mess";

/**
 * Log react of life-cycles.
 *
 * - only works for functional component.
 */
export const myLogger = <P extends {}>(
  name: string | null,
  Inner: React.FC<P>
): React.FC<P> => {
  const MyLogger = (props: P) => {
    if (name !== null) {
      semiRender(name, props);
    }

    return <Inner {...props} />;
  };

  return MyLogger;
};

//
// util
//

function semiRender<P>(name: string, props: P) {
  useEffect(() => {
    console.log(name + " mount");
    return () => {
      console.log(name + " unmount");
    };
  }, []);

  // props

  const [store] = useState<any>({});

  if (store.prev === undefined) {
    console.log("  " + name + " first render");
  } else {
    if (shallowEqualObjects(store.prev, props)) {
      console.log("  " + name + " reused");
    } else {
      // this isn't that interesting, but make it opt-in.
      console.log("  " + name + " rerender");
      console.log(getDiffAsString(store.prev, props));
    }
  }

  // save props
  store.prev = props;
}
