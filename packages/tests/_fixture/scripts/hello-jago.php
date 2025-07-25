<?php

use wiph_dev\phasic\Jago;

//randomly picks stdout or stderr, because it's invariant.

Jago::$stdioType = mt_rand(0, 1) === 0 ? "stdout": "stderr";

out([1, 2, 3]);

Jago::log("hej", "dav");