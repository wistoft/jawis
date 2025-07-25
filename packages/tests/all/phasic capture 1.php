<?php

use wiph_dev\phasic\Capture;

echo json_encode(Capture::capture(null)) . "\n";
echo json_encode(Capture::capture(true)) . "\n";
echo json_encode(Capture::capture(false)) . "\n";
echo json_encode(Capture::capture(1)) . "\n";
echo json_encode(Capture::capture(1.0)) . "\n"; //decimals are removed
echo json_encode(Capture::capture(1.1)) . "\n";
echo json_encode(Capture::capture("hej")) . "\n";

// array

echo json_encode(Capture::capture([])) . "\n";
echo json_encode(Capture::capture([1, 2, 3])) . "\n";
echo json_encode(Capture::capture([[]])) . "\n";

// assoc array

echo json_encode(Capture::capture([1 => 1])) . "\n";
echo json_encode(Capture::capture(["hej" => "dav"])) . "\n";
echo json_encode(Capture::capture(["hej" => []])) . "\n";

//class

class Dog
{
}

class Fido extends Dog
{
    public $myProp = "hej";
    public $myProp2 = [1, 2, 3];
    public $myProp3 = ["a" => "b"];
    public $myProp4;

    public function __construct()
    {
      $this->myProp4 = new Dog();
    }
    //object, that can be invoked. No support for that in jago.
    // public function __invoke()
    // {}

    public static function myMethod()
    {
        return 1;
    }

    public function __toString()
    {
        return "Fido is classy";
    }

};

echo json_encode(Capture::capture(new stdClass())) . "\n";
echo json_encode(Capture::capture(new Fido())) . "\n";

//function

echo json_encode(Capture::capture(function () {})) . "\n";
echo json_encode(Capture::capture(["hej" => function () {}])) . "\n";

//array entries

echo json_encode(Capture::captureArrayEntries([1, []])) . "\n";
