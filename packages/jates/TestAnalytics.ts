import { ClientTestInfo } from "./internal";

/**
 *
 *
 */
export class TestAnalytics {
  private exexTime: { [_: string]: number | undefined } = {};

  /**
   *
   */
  public setTestExecTime = (testId: string, execTime: number | undefined) => {
    this.exexTime[testId] = execTime;
  };

  /**
   *
   * - if exec-time undefined test is but in front.
   */
  public sortTests = (tests: ClientTestInfo[]) =>
    [...tests].sort((a, b) => {
      const aTime = this.exexTime[a.id];
      const bTime = this.exexTime[b.id];

      if (aTime === undefined && bTime === undefined) {
        return a.name === b.name ? 0 : a.name < b.name ? -1 : 1;
      }

      if (aTime === undefined) {
        return -1; // a precedes
      }

      if (bTime === undefined) {
        return 1; // b precedes
      }

      return aTime - bTime;
    });
}
