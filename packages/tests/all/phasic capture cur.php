<?php

use wiph_dev\phasic\Capture;

enum Suit
{
    case Hearts;
    case Diamonds;
}

echo json_encode(Capture::capture(["123456", "123456"], 10, 10)) . "\n";