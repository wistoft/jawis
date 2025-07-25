<?php

namespace jate_bahat;

use wiph_dev\phasic\Jago;

$hasSendResult = false;

/**
 * duplicated in PhpUnitAdapter
 */
function sendEmptyResultIfNothingHasBeenSent()
{
    global $hasSendResult;

    $isRunningTest = getenv("DRYRUN") === "false";

    if (!$hasSendResult && $isRunningTest){
        sendTestResult([
            "cur" => [
                "user" => new \stdClass()
            ]
        ]);
    }
}

/**
 * duplicated in PhpUnitAdapter
 */
function sendTestResult($res)
{
    global $hasSendResult;
    
    $hasSendResult = true;
    Jago::jago_send_message_via_stdio($res);
}
