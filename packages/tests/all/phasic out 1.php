<?php

use wiph_dev\phasic\Jago;
use wiph_dev\tests\_fixture\TestUtil;

TestUtil::setDevJagoErrorHandlers();

class Fido
{};

Jago::log("out", null);
Jago::log("out", true);
Jago::log("out", false);
Jago::log("out", 144);
Jago::log("out", 1.1);
Jago::log("out", "hej");
Jago::log("out", []);
Jago::log("out", [1, 2, 3]);
Jago::log("out", ["hej" => "dav"]);
Jago::log("out", new Fido());
Jago::log("out", 1, [2]);
