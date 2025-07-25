<?php

namespace jate_bahat;

use Behat\Testwork\ServiceContainer\Extension;
use Behat\Testwork\ServiceContainer\ExtensionManager;
use Symfony\Component\Config\Definition\Builder\ArrayNodeDefinition;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Definition;

/**
 * 
 */
class MyExtension implements Extension
{
    public function getConfigKey(){
        return "jate_bahat";
    }

    /**
     * 
     */
    public function initialize(ExtensionManager $extensionManager){
    }
    
    /**
     * 
     */
    public function configure(ArrayNodeDefinition $builder){
    }

    /**
     * 
     */
    public function load(ContainerBuilder $container, array $config){

        $definition = new Definition("jate_bahat\\Formatter");
        
        $definition->addTag("output.formatter");

        $container->setDefinition("has-no-purpose-what-so-ever", $definition);

    }

    public function process(ContainerBuilder $container){
    }

}