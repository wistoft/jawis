<?php

// autoload just for wiph packages

spl_autoload_register(function ($class) {
  if (!preg_match('/^wiph_dev/', $class)){
	  return;
  }

  $trimmed = str_replace('\\', DIRECTORY_SEPARATOR, $class).'.php';
  $trimmed = preg_replace('/^wiph_dev/', "", $trimmed);
  $file = __DIR__ . DIRECTORY_SEPARATOR . $trimmed;
  if (file_exists($file)) {
      require $file;
      return true;
  }
  return false;
});
