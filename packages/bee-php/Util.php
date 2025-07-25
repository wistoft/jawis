<?php

namespace wiph_dev\php_bee;

/**
 * 
 */
function requireAutoLoader(string $dirname){
  $last = null;
  while ($dirname !== $last){

    $file = $dirname . "/autoload.php";
    
    if (file_exists($file)){
      require_once $file;
      return;
    }

    $last = $dirname;
    $dirname = dirname($dirname);
  }
}