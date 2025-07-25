import React from "react";

import { capturedTosGeneral, CapturedValue, StringKeys, Strings } from "^jab";

/**
 *
 */
export const capturedToHtml = (value: CapturedValue) =>
  replaceAtoms(toAtomizedString(value));

/**
 *
 */
export const capturedArrayEntriesToHtml = (arr: CapturedValue[]) =>
  arr.map((entry, argIndex) => (
    <React.Fragment key={argIndex}>
      <div />
      {capturedToHtml(entry)}
      <div />
    </React.Fragment>
  ));

/**
 *
 */
export const makeToAtomizedString =
  (mapToAtoms: Strings) => (value: CapturedValue) =>
    capturedTosGeneral(value, mapToAtoms);

/**
 *
 */
export const makeReplaceAtoms =
  (
    atoms: string[],
    mapToFinal: {
      [_: string]: JSX.Element | string;
    }
  ) =>
  (str: string): Array<JSX.Element | string | null> => {
    const regExp = new RegExp("(" + atoms.join("|") + ")", "gu");

    const s = str.split(regExp);

    return s.map((sub, index) => {
      if (sub.match(regExp) !== null) {
        return <React.Fragment key={index}>{mapToFinal[sub]}</React.Fragment>;
      } else if (sub === "") {
        return null;
      } else {
        return sub;
      }
    });
  };

/**
 *
 */
export const mapToHtml_as_array: Array<[StringKeys, JSX.Element | string]> = [
  ["true", <i>true</i>],
  ["false", <i>false</i>],
  ["null", <i>null</i>],
  ["undefined", <i>undefined</i>],
  ["Infinity", <i>Infinity</i>],
  ["NaN", <i>NaN</i>],
  ["circular", <i>circular</i>],
  ["MaxDepth", <i>Max depth</i>],

  ["number-prefix", <i>Number: </i>],
  ["bigint-prefix", <i>BigInt: </i>],
  ["symbol-prefix", <i>Symbol: </i>],
  ["date-prefix", <i>Date: </i>],
  ["set-prefix", <i>Set: </i>],
  ["map-prefix", <i>Map: </i>],
  ["function-prefix", <i>Function: </i>],
  ["resource-prefix", <i>Resource: </i>],

  ["array-buffer-prefix", <i>ArrayBuffer: </i>],
  ["shared-array-buffer-prefix", <i>SharedArrayBuffer: </i>],
  ["data-view-prefix", <i>DataView: </i>],
  ["typed-array-prefix", <i>TypedArray: </i>],

  ["blank-string", <i>Blank string</i>],
  ["space", "\u2420"],
  ["tab", "\u2B7E"],
  ["newline", "\u2424"],

  ["brace-start", <i>{"{"}</i>],
  ["brace-end", <i>{"}"}</i>],
  ["bracket-start", <i>[</i>],
  ["bracket-end", <i>]</i>],

  ["partial-prefix", <i>Partial: </i>],
];

/**
 *
 */
export const getConf = (baseChar: number) => {
  const mapToAtoms = {} as Strings;
  const mapToFinal = {} as { [_: string]: JSX.Element | string };

  const atoms: string[] = [];

  mapToHtml_as_array.forEach((def, index) => {
    const char = String.fromCodePoint(baseChar + index);
    mapToAtoms[def[0]] = char;
    mapToFinal[char] = def[1];
    atoms.push(char);
  });

  return { mapToAtoms, mapToFinal, atoms };
};

//
// not that pretty (put should be puré)
//

const defaultConf = getConf(0xe000);

export const toAtomizedString = makeToAtomizedString(defaultConf.mapToAtoms);

export const replaceAtoms = makeReplaceAtoms(
  defaultConf.atoms,
  defaultConf.mapToFinal
);
