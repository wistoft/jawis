<?php

namespace wiph_dev\phasic;

use wiph_dev\phasic\Jago;
use wiph_dev\phasic\ErrorUtil;

$curErrorMessage = null;

/**
 * todo: configuration for using: log_error or throw ErrorException
 *
 *  Note: must return true, otherwise the error will be shown in `jago_shutdown_function` too.
 */
function jago_error_handler(
    int $errno,
    string $errstr,
    string $errfile,
    int $errline
): bool {
    global $curErrorMessage;

    if ($curErrorMessage){
        panic($errstr);
        return true;
    }

    $curErrorMessage = $errstr;
    
    if (Jago::$oldErrorHandler){
        //log error
        
        log_error($errno, $errstr, $errfile, $errline);

        // call next

        call_user_func(Jago::$oldErrorHandler, $errno, $errstr, $errfile, $errline);
        
        // would rather exit here, but then drupal wouldn't show anything.
        $curErrorMessage = null;
        
        return true;
    } else {
        $curErrorMessage = null;

        //$errfile and $errline does not contain relevant information. It's already in the trace.
        // Special case: when an error happens in jago_exception_handler. It will have no stack.
        // Too much work to make a CustomError that can carry that information.

        throw new \ErrorException($errstr, 0, $errno, __FILE__, __LINE__);
    }
}

/**
 *
 * Note: exception handler isn't called again if this throws an exception. But shutdown-handler will see the error.
 */
function jago_exception_handler(\Throwable $error){
    global $curErrorMessage;
    
    if ($curErrorMessage){
        panic($error->getMessage());
        return;
    }
    
    $curErrorMessage = $error->getMessage();
    
    Jago::jago_send_error($error);
    
    //next error handler
    
    if (Jago::$oldExceptionHandler){
        call_user_func(Jago::$oldExceptionHandler, $error);
    }
    
    $curErrorMessage = null;
}

/**
 * 
 * - Register a new shutdown function in order to be the last. Assuming no other shutdown functions do the same trick.
 * 
 * note
 *  - workdir is not reliable in this function
 */
function jago_shutdown_function(){
    if (Jago::$disabled){
        return;
    }

    try{
        $error = error_get_last();

        error_clear_last();
        
        //handle fatal errors
        
        if ($error) {
            //this is actually a new stack-type: php-unparsed
            log_error($error['type'], $error['message'], $error['file'], $error['line']);
        }

    } catch(\Throwable $error) {
        //an error here would be fully squashed, so this has to be dead simple.

        echo "Panic in jago_shutdown_function\n";
        echo $error;
    }

    //delay flush, because a shutdown function might have been registered for that purpose. And it must run first.
        
    register_shutdown_function(function (){

        //flush output buffer, in case problems are lurking there. Otherwise it's flushed implicitly later, and we can't detect errors.

        while (ob_get_level() !== 0){
            try{
                ob_end_flush();
            } catch(\Throwable $e) {
                Jago::jago_send_error($e);
            }
        }
    
    });
};

/**
 * 
 */
function safeErrorOutput($error) {
    echo "Panic: " . $error->getMessage() . "\n";
    echo "#  " . $error->getFile() . ":" . $error->getLine() . "\n";
    debug_print_backtrace();
};

/**
 * 
 */
function panic(string $message) {
    global $curErrorMessage;

    echo "Panic: Already handling error: " . $curErrorMessage . " \n";
    echo "Then this happened: " . $message . "\n";
};

/**
 *
 */
function log_error(
    int $errno,
    string $errstr,
    string $errfile,
    int $errline
) {

    Jago::jago_send_error_data([
        "msg" => $errstr,
        "info" => [],
        "stack" => [
            "type" => "parsed",
            "stack" => [[
                "line" => $errline,
                "file" => $errfile
            ]]
        ]
    ]);

}
