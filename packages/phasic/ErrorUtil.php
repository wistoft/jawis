<?php

namespace wiph_dev\phasic;

class ErrorUtil {

  private static \WeakMap $seenErrors;

  /**
   *
   * - Previous error is only included once. 
   */
  public static function getErrorDataArray(\Throwable $error)
  {

    //book keeping
    
    if (!isset(static::$seenErrors)){
	    static::$seenErrors = new \WeakMap();
    }

    static::$seenErrors[$error] = true;

    //handle main error
    
    $res[] = static::getErrorDataWithoutPrevious($error);

    //handle previous

    while ($error = $error->getPrevious()) {
      if (static::$seenErrors->offsetExists($error)){
        continue;
      }

      static::$seenErrors[$error] = true;

      array_unshift($res, static::getErrorDataWithoutPrevious($error));
    }

    return $res;
  }

  /**
   *
   */
  public static function getErrorDataWithoutPrevious(\Throwable $error)
  {
      return [
          "msg" => $error->getMessage(),
          "info" => [],
          "stack" => static::captureStack($error)
      ];
  }

  /**
   * - Shifts the function name up the trace. So the function in a stack frame is the
   *    containing function. This makes it consistent with JavaScript.
   * 
   * - Note: PHP reports the function that is called at the call site, while JavaScript
   *          reports the containing function.
   */
  public static function captureStack(\Throwable $error)
  {
      $res = [];

      $prevLine = $error->getLine();
      $prevFile = $error->getFile();

      foreach ($error->getTrace() as $frame) {
          if (isset($frame["class"])) {
              $func = $frame["class"] . $frame["type"] . $frame["function"];
          } else {
              $func = $frame["function"];
          }

          $res[] = [
              "line" => $prevLine,
              "file" => $prevFile,
              "func" => $func
          ];

          $prevLine = $frame["line"] ?? null;
          $prevFile = $frame["file"] ?? null;
      }

      $res[] = [
          "line" => $prevLine,
          "file" => $prevFile
      ];

      return [
          "type" => "parsed",
          "stack" => $res
      ];
  }

}
