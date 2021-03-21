import { clone } from "^jab";
import { TestProvision } from "^jarun";

export default ({ imp, eq }: TestProvision) => {
  eq(1, clone(1));
  eq(1.2, clone(1.2));
  eq(true, clone(true));
  eq(null, clone(null));

  eq(["NaN"], clone(NaN));
  eq(["Infinity"], clone(Infinity));

  eq(["undefined"], clone(undefined));
  eq(["symbol", "Symbol(Symbol.iterator)"], clone(Symbol.iterator));

  //
  // arrays
  //

  eq(["value", []], clone([]));
  eq(["value", ["hej", {}]], clone(["hej", {}]));
  eq(["value", [1, ["circular"]]], clone(arrCirc));

  //
  // objects
  //

  eq({ arr: ["value", []] }, clone({ arr: [] }));
  eq({ ok: 1, oops: ["circular"] }, clone(objCirc));

  //
  // ArrayBuffers, etc.
  //

  imp(clone(new ArrayBuffer(10)));
  imp(clone(new SharedArrayBuffer(10)));
  imp(clone(new DataView(new ArrayBuffer(10))));

  // views

  imp(clone(new Uint8Array()));
  imp(clone(Buffer.from("\x00\x01\x02", "binary")));
  imp(clone(Buffer.from("hejsa", "binary")));

  imp(clone(Buffer.from("\u0100\u0200\u0300", "binary"))); //truncates high bytes.
  imp(clone(Buffer.from("\u0100\u0200\u0300")));
  imp(clone(Buffer.from("æøå𐍈𝟙€✓")));

  //very large

  imp(clone(Buffer.alloc(1000 * 1000)));
};

//
// util
//

const arrCirc: any = [1];
arrCirc.push(arrCirc);

const objCirc: any = { ok: 1 };
objCirc.oops = objCirc;
