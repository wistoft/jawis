import { capture } from "^jab";
import { TestProvision } from "^jarun";

export default ({ imp, eq }: TestProvision) => {
  eq(1, capture(1));
  eq(1.2, capture(1.2));
  eq(true, capture(true));
  eq(null, capture(null));

  eq(["NaN"], capture(NaN));
  eq(["Infinity"], capture(Infinity));

  eq(["undefined"], capture(undefined));
  eq(["symbol", "Symbol(Symbol.iterator)"], capture(Symbol.iterator));

  //
  // arrays
  //

  eq(["value", []], capture([]));
  eq(["value", ["hej", {}]], capture(["hej", {}]));
  eq(["value", [1, ["circular"]]], capture(arrCirc));

  //
  // objects
  //

  eq({ arr: ["value", []] }, capture({ arr: [] }));
  eq({ ok: 1, oops: ["circular"] }, capture(objCirc));

  //
  // ArrayBuffers, etc.
  //

  imp(capture(new ArrayBuffer(10)));
  imp(capture(new SharedArrayBuffer(10)));
  imp(capture(new DataView(new ArrayBuffer(10))));

  // views

  imp(capture(new Uint8Array()));
  imp(capture(Buffer.from("\x00\x01\x02", "binary")));
  imp(capture(Buffer.from("hejsa", "binary")));

  imp(capture(Buffer.from("\u0100\u0200\u0300", "binary"))); //truncates high bytes.
  imp(capture(Buffer.from("\u0100\u0200\u0300")));
  imp(capture(Buffer.from("æøå𐍈𝟙€✓")));

  //very large

  imp(capture(Buffer.alloc(1000 * 1000)));
};

//
// util
//

const arrCirc: any = [1];
arrCirc.push(arrCirc);

const objCirc: any = { ok: 1 };
objCirc.oops = objCirc;
