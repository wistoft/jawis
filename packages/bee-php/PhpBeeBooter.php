<?php

namespace wiph_dev\php_bee;

require_once __DIR__ . "/autoload.php"; //load wiph
require_once __DIR__ . "/Util.php"; //load php-bee

use wiph_dev\phasic\Jago;

//args

$ipc = json_decode(getenv("IPC_PROCESS_VARS"));
$args = json_decode(getenv("PHP_BEE_BOOTER"));

//setup

Jago::setStdioChannelConfig($ipc->stdioProtocolId, $ipc->beeChannelToken);

Jago::setJagoErrorHandlers();

Jago::registerGlobalFunctions();

//start the bee

requireAutoLoader(dirname($args->beeFilename));

require_once $args->beeFilename;
