import { TestProvision } from "^jarun";
import { getScriptPath, makePhpBee_test, makeTempFile } from "../_fixture";

export default (prov: TestProvision) =>
  makePhpBee_test(prov, {
    def: {
      filename: makeTempFile(`<?php
      
class Foo
{
    public static $prop = 24;
}
$obj = new Foo();
$obj->prop = 42;
`),
    },
  });
