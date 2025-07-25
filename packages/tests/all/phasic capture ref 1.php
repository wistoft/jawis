<?php

use wiph_dev\phasic\Capture;

//primitive value does not have reference after clone.

$val = 1;
$clone = Capture::capture($val);

print_r($clone);
$val = 2;
print_r($clone);

//array value does not have reference after clone.

$val = 3;
$arr = [&$val];
$clone = Capture::capture($arr);

print_r($clone);
$val = 4;
print_r($clone);