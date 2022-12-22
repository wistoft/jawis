import { TestProvision } from "^jarun";
import { extractDeps } from "^misc/dtp";
import { getInMemoryCompilerHost } from "^tests/_fixture";
import { getSourceFile } from "../_fixture";

export default (prov: TestProvision) => {
  const host = getInMemoryCompilerHost(
    {},
    {
      defaultFiles: {
        "/file.ts": "const t: number = '';",
        "/node_modules/library/index.ts": "",
      },
      debug: prov.div,
    }
  );

  //
  //export const, etc.
  //

  prov.imp(extractDeps(getSourceFile(`export const a = hej`), {}, host));
  prov.imp( extractDeps(getSourceFile(`export const f = () => {dav};`), {}, host) ); // prettier-ignore
  prov.imp( extractDeps(getSourceFile(`export const s = hej,a = dav;`), {}, host) ); // prettier-ignore
  prov.imp(extractDeps(getSourceFile(`export const g = function () {};`), {}, host)); // prettier-ignore
  //should detect, that a is local.
  prov.imp(extractDeps(getSourceFile(`export const a = 1, b = a`), {}, host));
  prov.imp(extractDeps(getSourceFile(`export const { name1, name2: alias } = obj;`), {}, host)); // prettier-ignore

  //
  //export declarations
  //

  prov.imp( extractDeps(getSourceFile(`export function hej(){ jens}`), {}, host) ); // prettier-ignore
  prov.imp(extractDeps(getSourceFile(`export class Dav{}`), {}, host));

  //
  // export existing vars
  //

  prov.imp(extractDeps(getSourceFile(`export {a}`), {}, host));
  prov.imp(extractDeps(getSourceFile(`export {a, b as alias}`), {}, host));

  //
  // re-export
  //

  prov.imp(extractDeps(getSourceFile(`export {a, b as alias} from "library"`), {}, host)); // prettier-ignore
  prov.imp(extractDeps(getSourceFile(`export * from "library"`), {}, host));
  prov.imp( extractDeps(getSourceFile(`export * as ns from "library"`), {}, host) ); // prettier-ignore

  //
  //export default
  //

  prov.imp(extractDeps(getSourceFile(`export default myVar`), {}, host));
  prov.imp( extractDeps(getSourceFile(`export default (a = dav) => hej`), {}, host) ); // prettier-ignore
  prov.imp(extractDeps(getSourceFile(`export default function (){ fido}`), {}, host)); // prettier-ignore
  prov.imp(extractDeps(getSourceFile(`export default function hej(){ myVar}`), {}, host)); // prettier-ignore

  prov.imp(extractDeps(getSourceFile(`export default class Dav{}`), {}, host));
  prov.imp(extractDeps(getSourceFile(`export default class {}`), {}, host));

  //
  //declare
  //

  prov.eq([], extractDeps(getSourceFile(`declare const a;`), {}, host));
  prov.eq( [], extractDeps(getSourceFile(`declare function fasdf();`), {}, host) ); // prettier-ignore
  prov.eq( [], extractDeps(getSourceFile(`declare function fasdf(hej=dav);`), {}, host) ); // prettier-ignore
  prov.eq([], extractDeps(getSourceFile(`declare class Dav{}`), {}, host));

  prov.eq([], extractDeps(getSourceFile(`export declare const a;`), {}, host));
  prov.eq( [], extractDeps(getSourceFile(`export declare class Dav{}`), {}, host) ); // prettier-ignore
};
