<?php

use wiph_dev\phasic\Capture;

//circular array

$arr = [];
$arr[0] = &$arr;

echo json_encode(Capture::capture($arr)) . "\n";

//circular object

$obj = new stdClass;
$obj->a = $obj;

echo json_encode(Capture::capture($obj)) . "\n";

//circular array & object

$arr2 = [];
$arr2[0] = new stdClass;
$arr2[0]->a = &$arr2;

echo json_encode(Capture::capture($arr2)) . "\n";
