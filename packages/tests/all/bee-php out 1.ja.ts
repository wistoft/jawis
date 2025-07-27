import { TestProvision } from "^jarun";
import { getScriptPath, makePhpBee_test, makeTempFile } from "../_fixture";

export default (prov: TestProvision) =>
  makePhpBee_test(prov, {
    def: {
      filename: makeTempFile(`<?php
use wiph_dev\\phasic\\Jago;

class Fido
{};

out(null);
out(true);
out(false);
out(144);
out(1.1);
out("hej");
out([]);
out([1, 2, 3]);
out(["hej" => "dav"]);
out(new Fido());
out(1, [2]);
`),
    },
  });
