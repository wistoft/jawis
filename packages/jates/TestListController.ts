import { Waiter } from "^state-waiter";

import { ClientTestInfo, ComposedTestFrameworkProv } from "./internal";

// prov

export type TestListControllerProv = {
  onRunAllTests: () => void;
  onRunCurrentSelection: () => void;
};

// deps

export type TestListControllerDeps = {
  testFramework: ComposedTestFrameworkProv;
  onTestSelectionReady: (tests: ClientTestInfo[]) => void;
  onError: (error: unknown) => void;
};

type States = "idle" | "fetching" | "stopping" | "done";
type Events = never;

/**
 *
 * todo: could be implemented better, to avoid starting unneeded work.
 */
export class TestListController implements TestListControllerProv {
  public waiter: Waiter<States, Events>;

  private state: "all" | "current" | "idle" = "idle";

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
    if (this.state === "all") {
      return; //already working on it
    }

    this.state = "all";

    return this.deps.testFramework.getTestInfo().then((data) => {
      if (this.state === "all") {
        this.deps.onTestSelectionReady(data);
        this.state = "idle";
      }
    });
  };

  /**
   *
   */
  public onRunCurrentSelection = () => {
    if (this.state === "current") {
      return; //already working on it
    }

    this.state = "current";

    return this.deps.testFramework
      .getCurrentSelectionTestInfo()
      .then((data) => {
        if (this.state === "current") {
          this.deps.onTestSelectionReady(data);
          this.state = "idle";
        }
      });
  };
}
