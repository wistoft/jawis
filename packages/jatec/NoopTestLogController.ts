import { TestLogsProv } from "./internal";

/**
 *
 */
export class NoopTestLogController implements TestLogsProv {
  /**
   *
   */
  public setCurLogs = () => {};

  /**
   *
   */
  public getExpLogs = () => Promise.resolve({ user: {} });

  /**
   * Accept all logs for a single test case.
   */
  public acceptTestLogs = async () => {
    throw new Error("not supported.");
  };

  /**
   * Accept a single log for a single test case.
   */
  public acceptTestLog = async () => {
    throw new Error("not supported.");
  };

  /**
   *
   */
  public getTempTestLogFiles = () => {
    throw new Error("not supported.");
  };
}
