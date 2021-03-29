import React, { memo } from "react";

import { err, splitSurroundingWhitespace } from "^jab";
import { replaceAtoms } from "^jab-react";
import { diff } from "^jawis-util/algs";

export type Props = {
  left: string;
  right: string;
};

/**
 * Show diff between two strings.
 *
 * - Underline white space at boundary of inserted/deleted text.
 * - Replace atoms in the strings. (Could be generalized as a replacer function: str => Element)
 *
 * impl
 *  - a little hacky to remove underline from the first ins/del.
 *    But it is to avoid underlining the indent, that is inserted for layout reasons.
 */
export const ViewDiff: React.FC<Props> = memo(({ left, right }) => {
  const k = diff(left, right);
  const d = k.map((entryWithAtoms, index) => {
    const entry = entryWithAtoms;

    if (typeof entry === "string") {
      return replaceAtoms(entry);
    } else if (entry[0] === "ins") {
      const a = index === 0 ? replaceAtoms(entry[1]) : wrapWhitespace(entry[1]);
      return <ins key={index}>{a}</ins>;
    } else if (entry[0] === "del") {
      const a = index === 0 ? replaceAtoms(entry[1]) : wrapWhitespace(entry[1]);
      return <del key={index}>{a}</del>;
    } else {
      throw err("Impossible.");
    }
  });

  return <pre>{d}</pre>;
});

ViewDiff.displayName = "ViewDiff";

//
// util
//

export const wrapWhitespace = (str: string) => {
  const [preStr, middle, postStr] = splitSurroundingWhitespace(str);

  let pre;
  if (preStr !== "") {
    pre = <span style={{ textDecoration: "underline" }}>{preStr}</span>;
  } else {
    pre = preStr;
  }

  let post;
  if (postStr !== "") {
    post = <span style={{ textDecoration: "underline" }}>{postStr}</span>;
  } else {
    post = postStr;
  }

  return (
    <>
      {pre}
      {replaceAtoms(middle)}
      {post}
    </>
  );
};
