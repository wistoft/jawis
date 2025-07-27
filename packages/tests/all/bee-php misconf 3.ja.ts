import { TestProvision } from "^jarun";
import { getScriptPath, makePhpBee_test, makeTempFile } from "../_fixture";

export default (prov: TestProvision) =>
  makePhpBee_test(prov, {
    def: {
      filename: makeTempFile(`<?php
use wiph_dev\\phasic\\Jago;

//misconfiguration that cause handler to error.

Jago::$oldExceptionHandler = function (){
  "" . [];
};

//exception that makes the handler attempt to log something

throw new \\Exception("original exception");

`),
    },
  });
