<?php

use wiph_dev\phasic\Jago;

/**
 * - Protects against recursive use, by sending to var_dump in that case.
 *    This avoid infinite loop, if `out` is used during execution.
 */
function out(...$args){
    static $inUse = false;

    if ($inUse){
        var_dump($args); echo "\n";
        return;
    }

    $inUse = true;
    
    Jago::log("out", ...$args);

    $inUse = false;
}
