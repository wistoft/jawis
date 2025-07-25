<?php

use wiph_dev\phasic\Capture;

enum Suit
{
    case Hearts;
    case Diamonds;
}

echo json_encode(Capture::capture(Suit::Diamonds::class)) . "\n";