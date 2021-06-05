import { extractDeps } from "^util-javi/dtp";
import { TestProvision } from "^jarun";
import {
  getInMemoryCompilerHost,
  getJsxSourceFile,
  getSourceFile,
} from "^tests/_fixture";

export default (prov: TestProvision) => {
  const host = getInMemoryCompilerHost(
    {},
    {
      defaultFiles: { "file.ts": "const t: number = '';" },
      debug: prov.div,
    }
  );

  //
  //main code
  //

  //expressions

  prov.eq([], extractDeps(getSourceFile(``), {}, host));
  prov.imp(extractDeps(getSourceFile(`true`), {}, host));
  prov.imp(extractDeps(getSourceFile(`undefined; NaN; Infinity;`), {}, host)); //weird they are dependencies
  prov.imp(extractDeps(getSourceFile(`func()`), {}, host));
  prov.imp(extractDeps(getSourceFile(`func()()`), {}, host));
  prov.imp(extractDeps(getSourceFile(`a(b)`), {}, host));
  prov.imp(extractDeps(getSourceFile(`new Obj(param)`), {}, host));
  prov.imp(extractDeps(getSourceFile(`a === b`), {}, host));
  prov.imp(extractDeps(getSourceFile(`a.b`), {}, host));
  prov.imp(extractDeps(getSourceFile(`a[b]`), {}, host));
  prov.imp(extractDeps(getSourceFile(`[hej]`), {}, host));
  prov.imp(extractDeps(getSourceFile("` ${hej} ${dav()} `"), {}, host));
  prov.imp(extractDeps(getSourceFile(`(function (){})`), {}, host));
  prov.eq([], extractDeps(getSourceFile(`true ? 1 : 0`), {}, host));
  prov.imp(extractDeps(getSourceFile(`typeof val`), {}, host));
  prov.imp(extractDeps(getSourceFile(`delete obj[0]`), {}, host));
  prov.imp(extractDeps(getSourceFile(`(a = 1)`), {}, host));
  prov.imp(extractDeps(getSourceFile(`({a} = 1)`), {}, host));
  prov.imp(extractDeps(getSourceFile(`({a=1} = 1)`), {}, host));
  prov.imp(extractDeps(getSourceFile(`[a] = [1]`), {}, host));

  //object literal

  prov.imp(extractDeps(getSourceFile(`({a:1})`), {}, host));
  prov.imp(extractDeps(getSourceFile(`({"a":1})`), {}, host));
  prov.imp(extractDeps(getSourceFile(`({[a]:b})`), {}, host));
  prov.imp(extractDeps(getSourceFile(`({...obj})`), {}, host));
  prov.imp(extractDeps(getSourceFile(`({prop})`), {}, host));
  prov.imp(extractDeps(getSourceFile(`( { hej(){ dav } })`), {}, host));
  prov.imp(extractDeps(getSourceFile(`( { set fido(val=hej) {} })`), {}, host)); // prettier-ignore
  prov.imp(extractDeps(getSourceFile(`( { get fido() { return hej; } })`), {}, host)); // prettier-ignore

  //class expressions

  prov.imp(extractDeps(getSourceFile(`(class {})`), {}, host));
  prov.imp(extractDeps(getSourceFile(`(class { prop = hej})`), {}, host));
  prov.imp(extractDeps(getSourceFile(`(class { [dav] = hej; })`), {}, host));
  prov.imp(extractDeps(getSourceFile(`(class { #meth = hej; })`), {}, host));

  prov.imp(extractDeps(getSourceFile(`(class { hej(){ dav } })`), {}, host));
  prov.imp(extractDeps(getSourceFile(`(class { set fido(val=hej) {} })`), {}, host)); // prettier-ignore
  prov.imp(extractDeps(getSourceFile(`(class { get fido() { return hej; } })`), {}, host)); // prettier-ignore
  prov.imp(extractDeps(getSourceFile(`(class { set [hans] (b){} } })`), {}, host)); // prettier-ignore

  prov.imp(extractDeps(getSourceFile(`(class { constructor(){ super(); hej; this.dav;}; })`), {}, host ) ); // prettier-ignore
  prov.imp(extractDeps(getSourceFile(`(class extends B{})`), {}, host));
  prov.imp(extractDeps(getSourceFile(`(class A extends B implements C, D{})`), {}, host)); // prettier-ignore
  prov.imp(extractDeps(getSourceFile(`(class extends a.b{})`), {}, host));
  prov.imp(extractDeps(getSourceFile(`(class extends foo(Bar))`), {}, host));

  //variable declarations

  prov.imp(extractDeps(getSourceFile("const a, b = hej;"), {}, host));
  prov.imp(extractDeps(getSourceFile("{ const a = b, c = d}"), {}, host));
  prov.imp(extractDeps(getSourceFile("{ const a = 1; const b = a}"), {}, host)); //should detect, that a is local.

  //bindings

  prov.imp(extractDeps(getSourceFile("const [] = [hej]"), {}, host));
  prov.imp(extractDeps(getSourceFile("const [,] = [1]"), {}, host));
  // `a` gets too much here. But fine for now.
  prov.imp( extractDeps(getSourceFile("const [a,d = dav] = [1, hej]"), {}, host) ); // prettier-ignore
  prov.imp(extractDeps(getSourceFile("const [[a = hej]] = [[2]]"), {}, host));
  prov.imp(extractDeps(getSourceFile("const {a} = {a:hej}"), {}, host));
  prov.imp(extractDeps(getSourceFile("const {a = dav} = {a:1}"), {}, host));
  prov.imp(extractDeps(getSourceFile("const {a:alias = dav} = 1"), {}, host));
  prov.imp(extractDeps(getSourceFile("const {a:{a}} = 1"), {}, host));
  prov.imp(extractDeps(getSourceFile("const {a:{b = hej}} = 1"), {}, host));
  prov.imp(extractDeps(getSourceFile("const {b:[a]} = 1"), {}, host));
  prov.imp(extractDeps(getSourceFile(`const {[a]: alias } = 1;`), {}, host));
  prov.imp(extractDeps(getSourceFile("const [ ...sdf] = hej;"), {}, host));

  //statements

  prov.imp(extractDeps(getSourceFile("if (hej){ }"), {}, host));
  prov.imp(extractDeps(getSourceFile("if (hej){ } else {dav} "), {}, host));
  prov.imp(extractDeps(getSourceFile("if (true) hej() else dav() "), {}, host));
  prov.imp(extractDeps(getSourceFile("while (hej){ }  "), {}, host));
  //should detect, that i is local.
  prov.imp( extractDeps(getSourceFile("for (let i = 0; i < hej; i++){ } "), {}, host) ); // prettier-ignore
  prov.imp(extractDeps(getSourceFile("for (hej;;){}"), {}, host));
  prov.imp(extractDeps(getSourceFile("for (let i of arr){ } "), {}, host));
  prov.imp( extractDeps(getSourceFile("for (let [a = hej] of arr){ } "), {}, host) ); // prettier-ignore
  prov.imp( extractDeps( getSourceFile(`try{ throw hej }catch(e) { dav } finally { ola }`), {}, host ) ); // prettier-ignore
  prov.imp( extractDeps( getSourceFile(`try{ }catch({msg = funny}) { } finally { }`), {}, host ) ); // prettier-ignore
  prov.imp( extractDeps( getSourceFile(`switch (hej) { case dav: alo; default: ola }`), {}, host ) ); // prettier-ignore

  //non top-level functions/classes

  prov.imp(extractDeps(getSourceFile(`{function asdf() {i}}`), {}, host));
  prov.imp(extractDeps(getSourceFile(`{class B extends A{}}`), {}, host));

  //internal code piece.

  prov.imp(extractDeps(getSourceFile(`const a = () => hej`), {}, host));
  prov.imp( extractDeps(getSourceFile(`const a = (...args) => { dav; }`), {}, host) ); // prettier-ignore

  prov.imp(extractDeps(getSourceFile(`function hej(){ return 1}`), {}, host));
  prov.imp(extractDeps(getSourceFile(`function hej(a=dav){}`), {}, host));

  //types

  prov.eq([], extractDeps(getSourceFile(`type b = 1`), {}, host));
  prov.eq([], extractDeps(getSourceFile(`export type b = 1`), {}, host));
  prov.eq([], extractDeps(getSourceFile(`interface I{}`), {}, host));
  prov.eq([], extractDeps(getSourceFile(`1 as number`), {}, host));
  prov.imp(extractDeps(getSourceFile(`<A>myVar`), {}, host)); //weird they are dependencies

  //jsx

  prov.eq([], extractDeps(getJsxSourceFile(`<a />`), {}, host));
  prov.eq([], extractDeps(getJsxSourceFile(`<a b="hej"/>`), {}, host));
  prov.eq([], extractDeps(getJsxSourceFile(`<a isThisAllowed />`), {}, host));
  prov.imp(extractDeps(getJsxSourceFile(`<a b={c}/>`), {}, host));
  prov.imp(extractDeps(getJsxSourceFile(`<a {...obj}/>`), {}, host));

  prov.imp(extractDeps(getJsxSourceFile(`<Comp b={c}/>`), {}, host));

  //other closing

  prov.imp(extractDeps(getJsxSourceFile(`<a b={hej}>hej</a>`), {}, host));
  prov.imp(extractDeps(getJsxSourceFile(`<A>{dav}</A>`), {}, host));
  prov.imp(extractDeps(getJsxSourceFile(`<A><>{hej}</></A>`), {}, host));
  prov.imp(extractDeps(getJsxSourceFile(`<>{hej}</>`), {}, host));

  prov.imp(extractDeps(getJsxSourceFile(`(<React.Fragment key={hej}></React.Fragment>)`), {}, host )); // prettier-ignore

  //modules (without implementations)

  prov.eq([], extractDeps(getSourceFile(`declare module "m";`), {}, host));
};
//
//
//
