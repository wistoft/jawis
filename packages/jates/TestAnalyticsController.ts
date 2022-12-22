import filewatcher from "filewatcher";
import { OnRequire } from "^jab-node";
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
  public ta: TestAnalytics;

  /**
   *
   */
  constructor(private deps: Deps) {
    this.ta = new TestAnalytics(deps);

    //watcher

    this.watcher = filewatcher();

    this.watcher.on("change", (file: string, stat: any) => {
      if (stat && stat.deleted === true) {
        this.ta.onDeletedFile(file);
      } else {
        this.ta.onChangedFile(file);
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

    this.ta.addDependency(msg.source, msg.file);
  };
}
