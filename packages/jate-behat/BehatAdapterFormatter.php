<?php

namespace jate_bahat;

use Behat\Behat\EventDispatcher\Event\FeatureTested;
use Behat\Behat\EventDispatcher\Event\BeforeFeatureTested;
use Behat\Behat\EventDispatcher\Event\AfterFeatureSetup;
use Behat\Behat\EventDispatcher\Event\AfterFeatureTested;

use Behat\Behat\EventDispatcher\Event\ScenarioTested;
use Behat\Behat\EventDispatcher\Event\BeforeScenarioTested;
use Behat\Behat\EventDispatcher\Event\AfterScenarioSetup;
use Behat\Behat\EventDispatcher\Event\AfterScenarioTested;

use Behat\Behat\EventDispatcher\Event\OutlineTested;
use Behat\Behat\EventDispatcher\Event\BeforeOutlineTested;
use Behat\Behat\EventDispatcher\Event\AfterOutlineTested;

use Behat\Behat\EventDispatcher\Event\ExampleTested;

use Behat\Behat\EventDispatcher\Event\StepTested;
use Behat\Behat\EventDispatcher\Event\BeforeStepTested;
use Behat\Behat\EventDispatcher\Event\AfterStepSetup;
use Behat\Behat\EventDispatcher\Event\AfterStepTested;

use wiph_dev\phasic\Jago;
use wiph_dev\phasic\ErrorUtil;

/**
 *
 */
class Formatter implements \Behat\Testwork\Output\Formatter {

  private $dryrun;
  
  public function __construct(){
    $this->dryrun = getenv("DRYRUN") === "true";
  }

  /**
   *
   */
  public function getName(){
      return 'jate_bahat';
  }

  /**
   *
   */
  public function getDescription(){
      return 'blabla';
  }

  /**
   *
   */
  public function setParameter($name, $value){}

  /**
   *
   */
  public function getParameter($name){
      return null;
  }

  /**
   *
   */
  public function getOutputPrinter(){
    //just for behat's sake
    return new \jate_bahat\Printer();
  }

  /**
   *
   */
  public static function getSubscribedEvents(){
    return [
      FeatureTested::BEFORE         => ['beforeFeature'],
      FeatureTested::AFTER_SETUP    => ['afterFeatureSetup'],
      FeatureTested::AFTER          => ['afterFeature'],

      ScenarioTested::AFTER_SETUP   => ['afterScenarioSetup'],
      ScenarioTested::AFTER         => ['afterScenario'],
      
      OutlineTested::AFTER          => ['afterOutline'],

      ExampleTested::AFTER_SETUP    => ['afterExampleSetup'],
      ExampleTested::AFTER          => ['afterExample'],
      
      StepTested::AFTER_SETUP       => ['afterStepSetup'],
      StepTested::AFTER             => ['afterStep'],
    ];
  }

  /**
   *
   */
  public function beforeFeature(BeforeFeatureTested  $event){
    if ($this->dryrun){
      $this->send_test_info($event->getFeature());
    }
  }

  /**
   *
   */
  public function afterFeatureSetup(AfterFeatureSetup  $event){
    $this->handleSetupEvent($event, $event->getNode()->getTitle());
  }

  /**
   *
   */
  public function afterExampleSetup(AfterScenarioSetup $event){
    $this->handleSetupEvent($event, $event->getNode()->getTitle());
  }

  /**
   *
   */
  public function afterScenarioSetup(AfterScenarioSetup $event){
    $this->handleSetupEvent($event, $event->getNode()->getTitle());
  }

  /**
   *
   */
  public function afterStepSetup(AfterStepSetup $event){
    $this->handleSetupEvent($event, $event->getNode()->getText());
  }

  /**
   *
   */
  public function afterStep(AfterStepTested $event){
    if ($this->dryrun) return;

    // handle result from step

      $result = $event->getTestResult(); //Behat\Behat\Tester\Result\ExecutedStepResult

      if ($result instanceof \Behat\Behat\Tester\Result\SkippedStepResult){
        return;
      }  
        
      if ($result instanceof \Behat\Behat\Tester\Result\UndefinedStepResult){
        $extraFrames = $this->getExtraStackFrames($event, $event->getNode()->getText());

        Jago::jago_send_error_data(
          [
            "msg" => "Missing step",
            "info" => [],
            "stack" => [
              "type" => "parsed",
              "stack" => $extraFrames
            ]
          ]
        );

        return;
      }

      $this->handleCallResult($result->getCallResult(), $event, $event->getNode()->getText());

    // handle teardown

      $this->handleTeardownEvent($event, $event->getNode()->getText());
    
  }

  /**
   *
   */
  public function afterOutline(AfterOutlineTested $event){
    if (!$this->dryrun){
      $this->send_test_result();
    }
  }
  
  /**
   *
   */
  public function afterExample(AfterScenarioTested $event){
    $this->handleTeardownEvent($event, $event->getNode()->getTitle());
  }
  
  /**
   *
   */
  public function afterScenario(AfterScenarioTested $event){
    if ($this->dryrun) return;

    $this->handleTeardownEvent($event, $event->getNode()->getTitle());

    $this->send_test_result();
  }
  
  /**
   *
   */
  public function afterFeature(AfterFeatureTested $event){
    $this->handleTeardownEvent($event, $event->getNode()->getTitle());
  }
  
  /**
   * todo: When an outline is running, it seems impossible to get the current example. 
   *        so we can't get the line number of the `example` only the `example outline`
   */
  private function getExtraStackFrames($event, string $title){

    $stack = [];

    $file = $event->getFeature()->getFile();
    $stepLine = $event->getNode()->getLine();

    // the stack frame for the current step

    $stack[] = [
      "func" => $title,
      "line" => $stepLine,
      "file" => $file
    ];

    return $stack;
  }

  /**
   *
   */
  private function handleSetupEvent($event, string $title){

    $setup = $event->getSetup();

    //todo: handle all types
    if ($setup instanceof \Behat\Testwork\Hook\Tester\Setup\HookedSetup){
      
      $callResults = $setup->getHookCallResults();
      
      foreach ($callResults as $result){
        $this->handleCallResult($result, $event, $title);
      }

    }
    
  }

  /**
   *
   */
  private function handleTeardownEvent($event, string $title){

    $teardown = $event->getTeardown();

    //todo: handle all types
    if ($teardown instanceof \Behat\Testwork\Hook\Tester\Setup\HookedTeardown){
      
      $callResults = $teardown->getHookCallResults();
      
      foreach ($callResults as $result){
        $this->handleCallResult($result, $event, $title);
      }

    }
  
  }

  /**
   *
   */
  private function handleCallResult(\Behat\Testwork\Call\CallResult $callResult, $event, string $title){

    //exception

    $exception = $callResult->getException();

    if ($exception !== null){
      $extraFrames = $this->getExtraStackFrames($event, $title);
      
      $this->sendErrorData($exception, $extraFrames);
    }

    //send stdout right away, so it's not taken out of order with stdout, that isn't buffered.

    $stdout = $callResult->getStdOut();

    if ($stdout !== null){
      Jago::logStream("stdout", $stdout);
    }
  }
    
  /**
   *
   */
  private function sendErrorData(\Throwable $error, array $extraStackFrame)
  {
    //send first

      $errorData = ErrorUtil::getErrorDataWithoutPrevious($error);

      Jago::jago_send_error_data([
          "msg" => $errorData["msg"],
          "info" => $errorData["info"],
          "stack" => [
              "type" => "parsed",
              "stack" => array_merge($errorData["stack"]["stack"], $extraStackFrame)
          ]
      ]);

    //send rest

      $rest = ErrorUtil::getErrorDataArray($error);

      array_pop($rest); //already sent above

      foreach ($rest as $errorData){
        Jago::jago_send_error_data($errorData);
      }
  }

  /**
   *
   */
  private function send_test_result(){
    \jate_bahat\sendTestResult([
      "cur" => [
        "user" => new \stdClass()
      ]
    ]);
  }

  /**
   *
   */
  private function send_test_info(\Behat\Gherkin\Node\FeatureNode $feature){
    
    $file = $feature->getFile();

    foreach ($feature->getScenarios() as $scenario){ 
      
      $title = $scenario->getTitle();
      $line = $scenario->getLine();
      
      Jago::jago_send_message_via_stdio([
        "id" => $file . ":" . $title,
        "name" => $title . " (" . basename($file) . ")",
        "file" => $file,
        "line" => $line
      ]);

    }
  }


}