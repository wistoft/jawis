import { TestProvision } from "^jarun";
import { getScriptPath, makePhpBee_test, makeTempFile } from "../_fixture";

//unflushed output buffer mapper

export default (prov: TestProvision) =>
  makePhpBee_test(prov, {
    def: {
      filename: makeTempFile(`<?php

ob_start(function () {
  echo "in ob mapper";

  throw new \\Exception('ups mapper');
});

ob_start(); //multiple buffering must be handled.

echo "ordinary-stdout\n";
`),
    },
  });
