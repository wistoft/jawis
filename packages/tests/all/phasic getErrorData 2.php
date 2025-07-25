<?php

use wiph_dev\phasic\ErrorUtil;
use wiph_dev\tests\_fixture\TestUtil;

$first = new \Exception("first");
$second = new \Exception("second", 0, $first);
$third = new \Exception("third", 0, $first);

//previous errors are only sent once

out(TestUtil::filter_error_data_array(ErrorUtil::getErrorDataArray($second)));
out(TestUtil::filter_error_data_array(ErrorUtil::getErrorDataArray($third)));
