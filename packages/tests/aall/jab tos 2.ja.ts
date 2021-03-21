import { tos } from "^jab";
import { TestProvision } from "^jarun";

export default ({ imp }: TestProvision) => {
  imp(tos('"'));
  imp(tos(1));
  imp(tos([1, 2, [3, "4\n5"]]));
  imp(tos("\n \nhej dav \t"));
  imp(tos({ space: " ", newline: "\n" }));

  imp(tos(" "));

  imp(tos(Buffer.from("hejsa")));
  imp(tos(Buffer.from("0101010101", "hex")));
  imp(tos(Buffer.from("\x00\x01\x02", "binary")));
  imp(tos(new Uint8Array()));
  imp(tos(Buffer.alloc(10)));

  imp(tos(new Set([1, 2])));

  imp(tos(new Map([[1, 2]])));

  imp(
    tos(
      new Map([
        [1, 10],
        [2, 20],
      ])
    )
  );
};
