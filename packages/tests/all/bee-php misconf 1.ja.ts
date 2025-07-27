import { TestProvision } from "^jarun";
import { getScriptPath, makePhpBee_test, makeTempFile } from "../_fixture";

export default (prov: TestProvision) =>
  makePhpBee_test(prov, {
    def: {
      filename: makeTempFile(`<?php
use wiph_dev\\phasic\\Jago;

//misconfiguration that cause handler to throw.

Jago::$oldErrorHandler = function (){
  throw new \\Exception("some exception");
};

//error that makes the handler attempt to log something

\${"var1"}["prop"];
`),
    },
  });
