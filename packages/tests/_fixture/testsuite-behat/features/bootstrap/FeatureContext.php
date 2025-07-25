<?php

use Behat\Behat\Context\Context;
use Behat\Behat\Hook\Scope\BeforeScenarioScope;

/**
 * 
 */
class FeatureContext implements Context
{
    private $throwBeforeStep = false;
    private $throwAfterStep = false;

    /**
     * 
     * @BeforeFeature @ThrowBeforeFeature
     */
    public static function before_feature($scope)
    {
        echo "before\n";
        
        throw new \Exception("before feature");

    } 
    
    /**
     * 
     * @AfterFeature @ThrowAfterFeature
     */
    public static function after_feature($scope)
    {
        echo "after\n";
        
        throw new \Exception("after feature");

    } 
    
    /**
     * 
     * @BeforeScenario @ThrowBeforeExample
     */
    public function before_example($scope)
    {
        echo "only before\n";
        
        throw new \Exception("before example");

    } 

    /**
     * 
     * @AfterScenario @ThrowAfterExample
     */
    public function after_example($scope)
    {
        echo "only after\n";
        
        throw new \Exception("after example");

    } 

    /**
     * 
     * @BeforeScenario @ThrowBeforeScenario
     */
    public function before_scenario($scope)
    {
        echo "only before\n";
        
        throw new \Exception("before scenario");

    } 

    /**
     * 
     * @AfterScenario @ThrowAfterScenario
     */
    public function after_scenario($scope)
    {
        echo "after 1\n";

        throw new \Exception("after scenario 1");
        
    } 

    /**
     * 
     * @AfterScenario @ThrowAfterScenario
     */
    public function after_scenario2($scope)
    {
        echo "after 2\n";
        
        throw new \Exception("after scenario 2");

    } 

    /**
     * @Then set throw before step
     */
    public function set_throw_before_step()
    {
        $this->throwBeforeStep = true;
    } 

    /**
     * @Then set throw after step
     */
    public function set_throw_after_step()
    {
        $this->throwAfterStep = true;
    } 

    /**
     * @BeforeStep
     */
    public function before_step($scope)
    {
        if ($this->throwBeforeStep){
            $this->throwBeforeStep = false;

            echo "before\n";
        
            throw new \Exception("before step");
        }
    } 
    
    /**
     * @AfterStep
     */
    public function after_step($scope)
    {
        if ($this->throwAfterStep){
            $this->throwAfterStep = false;

            echo "after\n";
        
            throw new \Exception("after step");
        }
    } 
    
    /**
     * @Then writeln :arg1
     */
    public function writeln($arg1)
    {
        echo $arg1 . "\n";
    }

    /**
     * @Then jago out: :arg1
     */
    public function jagoOut($arg1)
    {
        out($arg1);
        out(["it's null" => null]);
    }

    /**
     * @Then noop
     */
    public function noop()
    {
    }

    /**
     * @Then throw
     */
    public function throw()
    {
        throw new \Exception("You asked for it");
    }
    
    /**
     * @Then it's fatal
     */
    public function fatal()
    {
        func_does_not_exist();
    }
    
}
