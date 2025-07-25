Feature: hello behat

  Scenario: Succeeds
    Then noop

  Scenario: Throws
    Then throw

  Scenario: Output
    Then writeln fido

  Scenario: Jago out
    Then jago out: dav

  Scenario: Missing
    Then the step does not exist

  Scenario: Fatal
    Then it's fatal

  Scenario Outline: Scenarios
    Then writeln <arg2>

      Scenarios:
      | arg1   | arg2 |
      | dav | fido |
      | dav | hans |

  @ThrowBeforeScenario
  Scenario: ThrowBeforeScenario
    Then writeln unreach

  @ThrowAfterScenario
  Scenario: ThrowAfterScenario
    Then writeln in_scenario

  Scenario: ThrowAfterStep
    Then writeln step1
    Then set throw after step

  Scenario: ThrowBeforeStep
    Then writeln step1
    Then set throw before step
    Then writeln step2

  @ThrowBeforeExample
  Scenario Outline: ThrowBeforeExample
    Then writeln step1

      Scenarios:
      | arg1   | arg2 |
      | dav | fido |

  @ThrowAfterExample
  Scenario Outline: ThrowAfterExample
    Then writeln step1

      Scenarios:
      | arg1   | arg2 |
      | dav | fido |
