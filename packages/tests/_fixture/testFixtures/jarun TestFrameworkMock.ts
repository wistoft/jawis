import { AbsoluteFile, prej } from "^jab";
import { NoopTestLogController, TestFrameworkProv, TestResult } from "^jatec";
import { nightmare, sleepingValue } from "^yapu";

/**
 *
 */
export class TestFrameworkMock implements TestFrameworkProv {
  public testLogController = new NoopTestLogController();

  private listedTests = [
    "first.test",
    "second.test",
    "third.test",
    "forth.test",
  ];

  private results: any = {
    "first.test": "first result",
    "second.test": "second result",
    "third.test": "third result",
    "forth.test": "forth result",

    //additional tests
    "more1.test": "more1 result",
    "more2.test": "more2 result",

    "late.resolve.test": "more2 result",

    "eternal.test": "more2 result",
    "throws.test": "more2 result",
    "rejects.test": "more2 result",
  };

  public getTestInfo = () =>
    Promise.resolve(
      this.listedTests.map((file) => ({
        id: file,
        name: file,
        file: file as AbsoluteFile,
      }))
    );

  public getCurrentSelectionTestInfo = () =>
    this.getTestInfo().then((data) =>
      data.filter((x) => x.file === "first.test")
    );

  /**
   *
   */
  public runTest = (id: string) => {
    if (id === "late.resolve.test") {
      return sleepingValue(100, {
        cur: { user: { return: this.results[id] } },
      });
    }

    if (id === "late.reject.test") {
      return nightmare(100);
    }

    if (id === "eternal.test") {
      return new Promise<TestResult>(() => {});
    }

    if (id === "throws.test") {
      throw new Error("As told");
    }

    if (id === "rejects.test") {
      return prej("As told.");
    }

    return sleepingValue(10, {
      cur: { user: { return: this.results[id] } },
    });
  };

  public kill = () => Promise.resolve();
}
