import { err, assertNever, prej, Waiter } from "^jab";

import { TestFrameworkProv } from ".";

import { TestAnalytics } from "./TestAnalytics";
import { TestLogController } from "./TestLogController";

// prov

export type TestListControllerProv = {
  onRunAllTests: () => void;
  onRunCurrentSelection: () => void;
  onRunDtp: () => void;
};

// deps

export type TestListControllerDeps = {
  tf: TestFrameworkProv;
  ta: TestAnalytics;
  setTestExecutionList: (ids: string[]) => void;
  onTestSelectionReady: (tests: string[][]) => void;
  onError: (error: unknown) => void;
};

type States = "idle" | "fetching" | "stopping" | "done";
type Events = never;

/**
 * - Re-form test queue, based on events from the user.
 * - Sort test cases by execution time.
 * - Send test selection structure to client, and ask TEC to execute the tests.
 *
 * Test selection structure
 *  - Defines which tests the client presents to the user.
 *  - Defines a prioritisation of the tests. E.g. sorted by exec time.
 *  - Contains unselected tests as last level.
 *  - It's ok to have the client present tests, that aren't going to execute. The user might be
 *      interested in seeing the unselected tests.
 *
 * Test execution list
 *  - A subset of the selection structure. The tests that will execute.
 *
 * choice:
 *  - TEC guarantees not to send results, that are not in the test list. So we call tec.setTestList in same
 *      tick as sending new test selection structure to the client. And the client is guranteed only ever to
 *      receive test results in that list. The price is, that TEC drops the test result of the currently executing test.
 *      small price for a conceptually simple management of test list switches.
 *  - Otherwise we would have to filter tests, the client doesn't understand. Or give the client a list of all tests, so
 *      it can filter tests not in the selection structure. Maybe that's no problem, after all.
 */
export class TestListController implements TestListControllerProv {
  public waiter: Waiter<States, Events>;

  /**
   *
   */
  constructor(private deps: TestListControllerDeps) {
    this.waiter = new Waiter<States, Events>({
      onError: this.deps.onError,
      startState: "idle",
      stoppingState: "stopping",
      endState: "done",
    });
  }

  /**
   *
   */
  public onRunAllTests = () => {
    const state = this.waiter.getState();
    switch (state) {
      case "fetching":
        throw err("not impl.");

      case "idle":
        this.waiter.set("fetching");

        this.deps.tf.getTestIds().then(this.onFetchDone);
        break;

      case "stopping":
      case "done":
        throw err("Not active.");

      default:
        assertNever(state);
    }
  };

  /**
   *
   */
  public onRunCurrentSelection = () => {
    const state = this.waiter.getState();
    switch (state) {
      case "fetching":
        throw err("not impl.");

      case "idle":
        this.waiter.set("fetching");

        this.deps.tf.getCurrentSelectionTestIds().then(this.onFetchDone);
        break;

      case "stopping":
      case "done":
        throw err("Not active.");

      default:
        assertNever(state);
    }
  };

  /**
   * - return is just for test cases.
   */
  public onRunDtp = () => {
    const state = this.waiter.getState();

    switch (state) {
      case "fetching":
        throw err("not impl.");

      case "idle":
        this.waiter.set("fetching");

        return this.deps.tf.getTestIds().then(this.onDtpFetchDone);

      case "stopping":
      case "done":
        return prej("Not active");

      default:
        return assertNever(state);
    }
  };

  /**
   *
   */
  private onDtpFetchDone = (ids: string[]): void => {
    const state = this.waiter.getState();

    switch (state) {
      case "fetching": {
        this.waiter.set("idle");

        //get impact.

        this.deps.ta.setTests(ids); // this must be done before getImpact.

        const impact = this.deps.ta.getImpact();

        this.deps.onTestSelectionReady(impact);

        //start execution

        const flat = impact.reduce<string[]>((acc, cur) => acc.concat(cur), []);

        this.deps.setTestExecutionList(flat);

        return;
      }

      case "idle":
      case "stopping":
      case "done":
        err("Impossible: " + state);
        return;

      default:
        return assertNever(state);
    }
  };
  /**
   *
   */
  private onFetchDone = (ids: string[]) => {
    const state = this.waiter.getState();

    switch (state) {
      case "fetching": {
        this.waiter.set("idle");

        const sortedIds = this.deps.ta.sortTests(ids);

        this.deps.onTestSelectionReady([sortedIds]);

        this.deps.setTestExecutionList(sortedIds);

        return;
      }

      case "idle":
      case "stopping":
      case "done":
        err("Impossible: " + state);
        return false;

      default:
        return assertNever(state);
    }
  };
}
//
