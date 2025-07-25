<?php

use wiph_dev\phasic\ErrorUtil;
use wiph_dev\tests\_fixture\TestUtil;

$first = new \Exception("first");
$second = new \Exception("second", 0, $first);

//error, that have been sent by itself, is not shown when later included in previous

out(TestUtil::filter_error_data_array(ErrorUtil::getErrorDataArray($first)));
out(TestUtil::filter_error_data_array(ErrorUtil::getErrorDataArray($second)));
