<?php

use wiph_dev\phasic\ErrorUtil;
use wiph_dev\tests\_fixture\TestUtil;

$error = new \Exception("ups");

//non-previous errors are always shown.   

out(TestUtil::filter_error_data_array(ErrorUtil::getErrorDataArray($error)));
out(TestUtil::filter_error_data_array(ErrorUtil::getErrorDataArray($error)));