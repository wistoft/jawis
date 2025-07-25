<?php

use \PHPUnit\Framework\ExpectationFailedException;
use \SebastianBergmann\Comparator\ComparisonFailure;

use wiph_dev\phasic\Jago;
use wiph_dev\phasic\Capture;
use wiph_dev\phasic\ErrorUtil;

$hasSendResult = false;

/**
 * duplicated in BehatAdapter
 */
function sendEmptyResultIfNothingHasBeenSent()
{
    global $hasSendResult;

    if (!$hasSendResult){
        sendTestResult([
            "cur" => [
                "user" => new \stdClass()
            ]
        ]);
    }
}

/**
 * duplicated in BehatAdapter
 */
function sendTestResult($res)
{
    global $hasSendResult;
    
    $hasSendResult = true;

    Jago::jago_send_message_via_stdio($res);
}

/**
 *
 */
function getCheckLog(ExpectationFailedException $e, ComparisonFailure $failure)
{
    return [
        "exp" => Capture::capture($failure->getExpected()),
        "cur" => Capture::capture($failure->getActual()),
        "stack" => ErrorUtil::captureStack($e)
    ];
}
