<?php

use wiph_dev\phasic\Capture;

//max depth

echo json_encode(Capture::capture(5, 1)) . "\n";

echo json_encode(Capture::capture([7], 1)) . "\n";
echo json_encode(Capture::capture([7], 2)) . "\n";

echo json_encode(Capture::capture([3, [4]], 2)) . "\n";
echo json_encode(Capture::capture([5, [6]], 3)) . "\n";

echo json_encode(Capture::capture((object)["fido" => "hans"], 1)) . "\n";
echo json_encode(Capture::capture((object)["fido" => "hans"], 2)) . "\n";

echo json_encode(Capture::capture(["fido" => "hans"], 1)) . "\n";
echo json_encode(Capture::capture(["fido" => "hans"], 2)) . "\n";
