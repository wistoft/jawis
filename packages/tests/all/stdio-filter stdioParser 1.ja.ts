import { TestProvision } from "^jarun";

import { makeAnsiParser } from "^stdio-filter/internal";

export default (prov: TestProvision) => {
  const parser = makeAnsiParser({
    onPrint: (str) => prov.log("print", str),
    onAction: (action, count) => prov.log("action", action, count),
    onAction2: (action) => prov.log("action2", action),
    setPosition: (x, y) => prov.log("position", { x, y }),
  });

  parser.parse("Hello World!\nline two");
  parser.parse("\x00"); //no special meaning

  parser.parse("\x1b[A"); //up
  parser.parse("\x1b[2A");

  parser.parse("\x1b[B"); //down
  parser.parse("\x1b[2B");

  parser.parse("\x1b[C"); //right
  parser.parse("\x1b[2C");

  parser.parse("\x1b[D"); //left
  parser.parse("\x1b[2D");

  parser.parse("\x1b[E"); //down-beginning
  parser.parse("\x1b[2E");

  parser.parse("\x1b[F"); //up-beginning
  parser.parse("\x1b[2F");

  parser.parse("\x1b[G"); //x-position
  parser.parse("\x1b[2G");

  parser.parse("\x1b[H");
  parser.parse("\x1b[2H");
  parser.parse("\x1b[2;H");
  parser.parse("\x1b[;3H");
  parser.parse("\x1b[2;3H");
};
