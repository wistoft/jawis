import { OnRequire } from "^jabc";
import filewatcher from "filewatcher";
import { TestAnalytics } from "./TestAnalytics";

type Deps = {
  absTestFolder: string;
  onError: (error: unknown) => void;
};

/**
 *
 */
export class TestAnalyticsController {
  private watcher: any;
  public testAnalytics: TestAnalytics;

  /**
   *
   */
  constructor(private deps: Deps) {
    this.testAnalytics = new TestAnalytics(deps);

    //watcher

    this.watcher = filewatcher();

    this.watcher.on("change", (file: string, stat: any) => {
      if (stat && stat.deleted === true) {
        this.testAnalytics.onDeletedFile(file);
      } else {
        this.testAnalytics.onChangedFile(file);
      }
    });

    this.watcher.on("fallback", () => {
      this.deps.onError(new Error("filewatcher fallback"));
    });
  }

  /**
   *
   */
  public onRequire: OnRequire = (msg) => {
    if (!msg.source) {
      throw new Error("no source");
    }

    this.watcher.add(msg.file);

    this.testAnalytics.addDependency(msg.source, msg.file);
  };
}
