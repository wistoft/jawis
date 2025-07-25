<?php

namespace wiph_dev\tests\_fixture;

use \wiph_dev\phasic\Jago;

class TestUtil {
  
  /**
   * 
   */
  public static function setDevJagoErrorHandlers(){

    //unregister error handling, because jago will keep calling them.
    
      set_error_handler(null);
      set_exception_handler(null);
      
    //can only disable shutdown_function by cooperation with live jago.
      
      \wiph\phasic\Jago::$disabled = true;

    //set new handlers
      
      Jago::setJagoErrorHandlers();

      Jago::setStdioChannelConfig("stdioProtocolId-dummy", "beeChannelToken-dummy", "stderr", true);
    
  }

  /**
   *
   */
  public static function filter_error_data_array($errors){
      return array_map([Jago::class, "filter_error_data"], $errors);
  }

}