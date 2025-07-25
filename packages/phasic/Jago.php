<?php

namespace wiph_dev\phasic;

require_once __DIR__ . "/error.php";

/**
 * rename PhpBee
 */
class Jago
{
    
    //1. output method
    private static $stdioProtocolId;
    private static $beeChannelToken;
    public static $stdioType;
    private static $filter_error_data_for_test;

    //2. output method
    private static $jagoLogFolder;
    private static $jagoLogName;
    private static $randomNumber;
    private static $logCount;
    
    //old handler
    public static $oldErrorHandler;
    public static $oldExceptionHandler;

    public static $disabled = false;

    /**
     * Default is to send via stderr, because php scripts can capture stdout, and use it for something else. It would break
     *  those scripts, and the message would get lost.
     */
    public static function setStdioChannelConfig(string $stdioProtocolId, string $beeChannelToken, string $stdioType = "stderr", bool $filter_error_data_for_test = false)
    {
        static::$stdioProtocolId = $stdioProtocolId;
        static::$beeChannelToken = $beeChannelToken;
        static::$stdioType = $stdioType;
        static::$filter_error_data_for_test = $filter_error_data_for_test;
    }
    
    /**
     *  - log folder must be absolute.
     * 
     * impl
     *  - No need for a token in this case, because it's not used as ipc.
     */
    public static function setJagoFileChannelConfig(string $jagoLogFolder, string $jagoLogName)
    {
        static::$jagoLogFolder = $jagoLogFolder;
        static::$jagoLogName = $jagoLogName;
        static::$randomNumber = mt_rand();
        static::$logCount = 0;
    }

    /**
     * Ignores existing shutdown handlers
     */
    public static function setJagoErrorHandlers()
    {
        static $alreadyCalled = false;

        if ($alreadyCalled === true){
            throw new \Exception("setJagoErrorHandlers can only be called once.");
        }

        $alreadyCalled = true;

        error_reporting(0); //fatal errors, that only shutdown handler gets, will be printed, if this is to E_ALL

        $old1 = set_error_handler("wiph_dev\phasic\jago_error_handler");
        $old2 = set_exception_handler("wiph_dev\phasic\jago_exception_handler");

        if ($old1 !== null){
            throw new \Exception("There was an error_handler already");
        }

        if ($old2 !== null){
            throw new \Exception("There was an exception_handler already");
        }

        static::ensureShutdownRegistered();
    }

    /**
     * - Sets error handlers as the first to run
     * - Keeps the existing error handlers, so errors are possibly duplicated.
     */
    public static function setJagoErrorHandlers_before_current_errorhandler()
    {
        static $alreadyCalled = false;

        if ($alreadyCalled === true){
            throw new \Exception("setJagoErrorHandlers_before_current_errorhandler can only be called once.");
        }

        $alreadyCalled = true;

        static::$oldErrorHandler = set_error_handler("wiph_dev\phasic\jago_error_handler");
        static::$oldExceptionHandler = set_exception_handler("wiph_dev\phasic\jago_exception_handler");

        static::ensureShutdownRegistered();
    }

    /**
     *
     */
    private static function ensureShutdownRegistered()
    {    
        static $registered = false;

        if ($registered){
            return;
        }

        $registered = true;

        //There can be multiple of these, so doesn't need to save for calling later.
        // Can we remove the old one?

        register_shutdown_function("wiph_dev\phasic\jago_shutdown_function");
    }

    /**
     * Must only be called once.
     */
    public static function registerGlobalFunctions()
    {
        require __DIR__ . "/jago-global.php";
    }

    /**
     *
     */
    static function log($name, ...$args)
    {
        static::jago_send([
            "type" => "log",
            "data" => Capture::captureArrayEntries($args),
            "logName" => $name
        ]);
    }

    /**
     *
     */
    static function logStream(string $name, string $value)
    {
        static::jago_send([
            "type" => "stream",
            "data" => $value,
            "logName" => $name
        ]);

    }

    /**
     * quick fix
     */
    public static function filter_error_data($data)
    {
        $data["stack"]["stack"] = array_map( function($stack){
            return [...$stack, "file" => basename($stack["file"] ?? "")];
        }, $data["stack"]["stack"]);

        return $data;
    }

    /**
     *
     */
    public static function jago_send_error($error)
    {
        foreach (ErrorUtil::getErrorDataArray($error) as $errorData){
            static::jago_send_error_data($errorData);
        }
    }

    /**
     *
     */
    public static function jago_send_error_data($data)
    {
        if (static::$filter_error_data_for_test){
            $data = static::filter_error_data($data);
        }

        static::jago_send([
            "type" => "error",
            "data" => $data
        ]);
    }

    /**
     * Send a jago message. E.g. logs, errors.
     * 
     *  - Chooses between the output methods
     */
    public static function jago_send($data)
    {
        if (static::$disabled){
	        return;
        }
        
        if (static::$beeChannelToken) {
            
            static::jago_send_message_via_stdio(array_merge(
                ["beeLog" => static::$beeChannelToken],
                $data)
            );
            
        } else if (static::$jagoLogFolder) {
            

            static::send_jago_message_to_file($data);

        } else {
            echo "Unknown output method in jago";
            echo json_encode($data, JSON_PRETTY_PRINT) . "\n";
        }

    }

    /**
     * Use jago's log folder convention.
     */
    private static function send_jago_message_to_file($data)
    {
        static::$logCount++;

        $file = static::$jagoLogFolder . "/" . static::$jagoLogName . "-" . static::$randomNumber . "-" . static::$logCount . ".json";
        
        $json = json_encode($data) . "\n";

        file_put_contents($file, $json);
    }

    /**
     * Use jago's stdio protocol
     */
    public static function jago_send_message_via_stdio($value)
    {

        if (!static::$stdioProtocolId) {
            throw new \Exception('stdioProtocolId is not set.');
        }

        //pick stream
        
        if (static::$stdioType === "stdout") {
            $stream = STDOUT;
        } else if (static::$stdioType === "stderr"){
            $stream = STDERR;
        }else{
            throw new \Exception('Unknown stdioType: ' . static::$stdioType);
        }

        //write

        fwrite($stream, "\n");
        fwrite($stream, static::$stdioProtocolId);
        fwrite($stream, json_encode($value, JSON_PRETTY_PRINT));
        fwrite($stream, "\n\x1F");
    }

}
