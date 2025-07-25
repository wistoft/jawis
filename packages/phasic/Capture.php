<?php

namespace wiph_dev\phasic;

const DEFAULT_MAX_DEPTH = 10;
const DEFAULT_MAX_SIZE = 10000;

class Capture
{
    
    /**
     *
     * - Follows the conventions of @jawis/jab#capture.
     *
     *
     * todo
     *  - maxSize is not implemented.
     *  - assoc array keys can be string or number. In jago only strings are possible.
     * 
     * impl
     *  - It's not possible to take $value by reference, because expression will not be capturable.
     *      This means a recursion on $value would run two loops until it's detected.
     */
    public static function capture($value, int $maxDepth = DEFAULT_MAX_DEPTH, int $maxSize = DEFAULT_MAX_SIZE)
    {
        $context = new Context($maxDepth, $maxSize);

        return internalCapture($value, $context);
    }

    /**
     * Captures only the entries in the array. Not the array itself.
     */
    public static function captureArrayEntries(array $arr, int $maxDepth = DEFAULT_MAX_DEPTH, int $maxSize = DEFAULT_MAX_SIZE)
    {
        $context = new Context($maxDepth, $maxSize);

        $mapper = fn ($values) => internalCapture($values, $context);

        return array_map($mapper, $arr);
    }
}

class Context
{
    public $depth = 0;
    public $size = 0;
    public $stop = false;

    /**
     * 
     */
    public function __construct(public int $maxDepth, public int $maxSize)
    {
        
    }
}

class NodeContext
{
    /**
     * 
     */
    public function __construct(public array $seenArrays, public array $seenObjects)
    {
    }
}

/**
 * Build the result gradually in a BFS approach.
 * 
 * impl
 *  - array-list, assoc-array and object fields are considered children, and deferred to next BFS level.
 *  - each level is built with holders. Children are in next level entered into those holders.
 *      - the holders are initially empty.
 *      - Or with a placeholder if max-depth, so the user can see there is missing data.
 * 
 */
function internalCapture($value, Context $context){

    $res = []; //will hold the final result.

    $initialNode = makeCaptureArrayRaw($res, [$value], $context, new NodeContext([], []));

    $queue = [$initialNode, onNewLevel(...)];

    $i = 0;

    while (count($queue) > 0){
         
        $func = array_shift($queue);
        
        $func($queue, $context);

        if ($context->stop){
            return ["partial", $res[0]];
        }

        if ($i++ > 20){
            throw new \Exception("debug-overflow");
        }
    }

    return $res[0];
}

/**
 *
 */
function onNewLevel(&$queue, Context $context){
    if (count($queue) === 0) return;

    //the checks

    $context->depth++;

    //check max depth

    if ($context->depth >= $context->maxDepth){
        $context->stop = true;
    }

    //add the listener, if the queue isn't empty

    $queue[] = onNewLevel(...);
}

/**
 *
 */
function captureValueHolder(&$value, Context $context, NodeContext $nodeContext)
{
    switch (gettype($value)) {
        case "NULL":
        case "boolean":
        case "integer":
        case "double":
            return ["clone" => $value, "toQueue" => null, "size" => 5];

        case "string":
            return ["clone" => $value, "toQueue" => null, "size" => strlen($value)];
            
        case "resource":
            return ["clone" => ["resource", get_resource_type($value)], "toQueue" => null, "size" => 0];
            
        case "resource (closed)":
            //get_resource_type just returns Unknown
            return ["clone" => ["resource", "closed"], "toQueue" => null, "size" => 0];
        
        case "array":
            return makeCaptureArrayHolder($value, $context, $nodeContext);

        case "object":
            return captureObjectHolder($value, $context, $nodeContext);
            
        default:
            throw new \Exception("Unknown type: " . gettype($value) . "\n");
            
    }
    
}

/**
 *
 */
function makeCaptureArrayHolder(array &$arr, Context $context, NodeContext $nodeContext)
{
    //check max depth

    if ($context->depth + 1 >= $context->maxDepth){
        //give up, if next depth is unallowed.
        if (array_is_list($arr)) {
            return ["clone" => ["value", [["MaxDepth"]]], "toQueue" => "dummy", "size" => 0];
        } else {
            return ["clone" => ["MaxDepth"], "toQueue" => "dummy", "size" => 0];
        }
    }

    //check for circles

    if (is_seen_array($nodeContext, $arr)){
        return ["clone" => ["circular"], "toQueue" => null, "size" => 0];
    }

    $newNodeContext = new NodeContext(array_merge($nodeContext->seenArrays, [&$arr]), $nodeContext->seenObjects);

    //start

    if (array_is_list($arr)) {
        //array with proper 0-indexed keys.
        $holder = [];
        $clone = ["value", &$holder];
    } else {
        //Plain object.
        $holder = new \stdClass;

        $clone = $holder;
    }
    
    return ["clone" => &$clone, "toQueue" => makeCaptureArrayRaw($holder, $arr, $context, $newNodeContext), "size" => 0];
}

/**
 *
 * impl
 *  - Assumes $arr has been checked for possible recursion. And the context contains $arr to detect further recursion.
 *  - There is no need for $arr to be by reference, because a root array by reference isn't possible.
 */
function makeCaptureArrayRaw(array|object &$holder, array $arr, Context $context, NodeContext $nodeContext) {
    
    return function (&$queue) use (&$holder, $arr, $context, $nodeContext) {

        $holder_type = gettype($holder);
    
        foreach ($arr as $key => &$value){
            
            $cloneAndQueue = captureValueHolder($value, $context, $nodeContext);
    
            ["clone" => &$clone, "toQueue" => $toQueue, "size" => $size] = $cloneAndQueue;
    
        //check size

        $context->size += $size;

        if ($context->size > $context->maxSize){
            $context->stop = true;
            return;
        }

        //use clone and toQueue
                
            if ($holder_type === "array") {
                $holder[$key] = &$clone;
            } else {
                $holder->$key = &$clone;
            }
            
            if (isset($toQueue)){
                $queue[] = $toQueue;
            }
    
        }

        
    };
}

/**
 *
 */
function makeCaptureObject(object $obj, Context $context, NodeContext $nodeContext)
{

    $holder = (object)["protoChain" => getProtoChain($obj)];

    //check max depth

    if ($context->depth + 1 >= $context->maxDepth){
        //give up, if next depth is unallowed.
        $holder->fields = ["_" => ["MaxDepth"]];
        return ["clone" => ["object", $holder], "toQueue" => "dummy", "size" => 0];
    }

    //check for cicles

    if (is_seen_object($nodeContext, $obj)){
        return ["clone" => ["circular"], "toQueue" => null, "size" => 0];
    }

    $newNodeContext = new NodeContext($nodeContext->seenArrays, array_merge($nodeContext->seenObjects, [$obj]));

    //defer the rest

    $toQueue = function (&$queue) use ($obj, $holder, $context, $newNodeContext)
    {
        //capture fields

        $fields = get_object_vars($obj);

        if (count($fields) === 0){
            //to ensure it becomes '{}' and not '[]', as an empty array would.
            $holder->fields = new \stdClass;
        } else {
            
            $holder->fields = [];
            makeCaptureArrayRaw($holder->fields, $fields, $context, $newNodeContext)($queue);
        }

        //strval

        if (method_exists($obj, "__toString")) {
            $holder->toStringValue = strval($obj);
        }
    };
    
    return ["clone" => ["object", $holder], "toQueue" => $toQueue, "size" => 0];
}

/**
 *
 */
function captureObjectHolder(object $value, Context $context, NodeContext $nodeContext)
{

    //function

    if (is_callable($value, false, $callable_name)) {
        //can't be string or array here, so not a callable by name.

        $name = $callable_name !== "Closure::__invoke" ? $callable_name : "anonymous";

        return ["clone" => ["function", $name], "toQueue" => null, "size" => 0];
    }

    return makeCaptureObject($value, $context, $nodeContext);
}

/**
 *
 */
function getProtoChain(object $value)
{
    $res = [get_class($value)];

    while (true) {

        $parent = get_parent_class($value);

        if ($parent === false) {
            return $res;
        }

        //dive down

        $res[] = $parent;

        $value = $parent;
    }
}

/**
 *
 */
function is_seen_array(NodeContext $nodeContext, array &$value){

    foreach ($nodeContext->seenArrays as &$a){
        if (is_ref($value, $a)){
            return true;
        }
    }

    return false;
}

/**
 *
 */
function is_seen_object(NodeContext $nodeContext, object $value){

    foreach ($nodeContext->seenObjects as $o){
        if ($value === $o){
            return true;
        }
    }

    return false;
}

/**
 *
 */
function is_ref(array &$a, array &$b){
    $tmp = $a;
    $a = null;
    $res = null === $b; //$b is an array at function-entry, so if it's null now, it must be a reference to $a.
    $a = $tmp;
  
    return $res;
}
