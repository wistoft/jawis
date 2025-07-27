import { TestProvision } from "^jarun";
import { getScriptPath, makePhpBee_test, makeTempFile } from "../_fixture";

export default (prov: TestProvision) =>
  makePhpBee_test(prov, {
    def: {
      filename: makeTempFile(`<?php
use wiph_dev\\phasic\\Jago;

//misconfiguration that cause handler to trigger new error.

Jago::$oldErrorHandler = function (){
  "" . [];
};

//error that makes the handler attempt to log something

$fido = $original_error;

echo "done"; //this is reached, because oldErrorHandler also cause script not to stop-on-error
`),
    },
  });
