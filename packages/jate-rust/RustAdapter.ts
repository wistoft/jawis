import fs from "node:fs";
import path from "node:path";
import {
  AbsoluteFile,
  CapturedValue,
  def,
  ErrorData,
  LogEntry,
  ParsedStackFrame,
  toInt,
  assert,
} from "^jab";
import {
  NoopTestLogController,
  TestFrameworkProv,
  TestInfo,
  TestLogsProv,
  TestResult,
} from "^jates";
import { FinallyFunc } from "^finally-provider";
import { StdProcess, StdProcessDeps } from "^process-util";
import { MakeBee } from "^bee-common";
import { listFilesRecursiveSync } from "^jab-node";
import { BeeRunner } from "^jarun";

type Deps = {
  absTestFolder: AbsoluteFile;
  onLog: (entry: LogEntry) => void;
  finally: FinallyFunc;
  testLogController?: TestLogsProv;
};

/**
 * todo
 *  - ignore ignored
 */
export class RustAdapter implements TestFrameworkProv {
  public testLogController: TestLogsProv;
  public runner: BeeRunner;

  constructor(private deps: Deps) {
    this.testLogController = deps.testLogController ?? new NoopTestLogController(); // prettier-ignore
    this.runner = new BeeRunner({
      makeBee: this.runCargoTest,
      finally: deps.finally,
    });
  }

  /**
   *
   */
  public getTestInfo = async () => {
    const res: TestInfo[] = [];

    const map = await this.getTestIdLookupMap();

    let all = listFilesRecursiveSync(this.deps.absTestFolder);

    all = all.filter((file) => file.endsWith(".rs"));

    for (const file of all) {
      for (const info of await parseFile(file)) {
        res.push({ ...info, id: def(map.get(info.name)) });
      }
    }

    return res;
  };

  /**
   *
   */
  public getCurrentSelectionTestInfo = async () => [];

  /**
   *
   */
  public runTest = async (globalId: string, testId: string) => {
    const res = await this.runner.runTest("unused", testId as any);

    this.filter_stdout_mutable(res);
    this.handle_stderr_mutable(res);

    return res;
  };

  /**
   * Mutates
   */
  private handle_stderr_mutable = async (res: TestResult) => {
    if (res.cur.user.stderr == undefined) {
      return;
    }

    const parsed = await parse_stderr(
      res.cur.user.stderr[0] as string,
      this.deps.absTestFolder
    );

    //errors

    if (parsed.errors.length !== 0) {
      //assumes there isn't any error already
      res.cur.err = parsed.errors;
    }

    //stderr

    if (parsed.stderr === "") {
      delete res.cur.user.stderr;
    } else {
      res.cur.user.stderr[0] = parsed.stderr;
    }
  };

  /**
   * Mutates
   */
  private filter_stdout_mutable = async (res: TestResult) => {
    if (res.cur.user.stdout == undefined) {
      return;
    }

    let filtered = res.cur.user.stdout[0] as string;

    //start
    filtered = filtered.replace(/^\nrunning \d+ tests?\n/, "");

    //end - succesful tests
    filtered = filtered.replace(
      /\.\ntest result: .+ 1 passed; \d+ failed; \d+ ignored; \d+ measured; \d+ filtered out; finished in \d.\d\ds\n\n$/,
      ""
    );

    //end - failed tests
    filtered = filtered.replace(/^.*FAILED(\n.*){9}$/, "");

    if (filtered === "") {
      delete res.cur.user.stdout;
    } else {
      res.cur.user.stdout[0] = filtered;
    }
  };

  /**
   *
   */
  private runCargoTest: MakeBee = (deps) =>
    new StdProcess({
      filename: "cargo",
      args: ["test", "-q", "--", "--nocapture", "--exact", deps.def.filename],
      cwd: this.deps.absTestFolder,
      env: {
        //needs these default env. Maybe PATH.
        ...process.env,

        CARGO_TARGET_DIR: "./build/build-jawis-cargo-test",
        RUSTFLAGS: "-Awarnings",
        RUST_BACKTRACE: "1",
        RUST_LOG: "warn",
      },
      ...deps,
    });

  /**
   *
   */
  public getTestIdLookupMap = async () => {
    const stdoutArray: string[] = [];

    await this.run_xremap_cargo_test("--list", {
      onStdout: (data: Buffer) => {
        stdoutArray.push(data.toString());
      },
    });

    const stdout = stdoutArray.join("");

    const lines: [string, string][] = stdout
      .split("\n")
      .filter((line) => line.endsWith(": test"))
      .map((line) => {
        const id = line.slice(0, -6);

        return [id.replace(/^.*::([^:]*)$/, "$1"), id];
      });

    return new Map(lines);
  };

  /**
   * prime cache
   *  - CARGO_TARGET_DIR=./build/build-jawis-cargo-test cargo test
   */
  run_xremap_cargo_test = (
    testName: string,
    deps?: Partial<StdProcessDeps>
  ) => {
    const proc = new StdProcess(
      this.getProcessDeps({
        filename: "cargo",
        args: ["test", "-q", "--", "--nocapture", testName],
        cwd: this.deps.absTestFolder,
        env: {
          //needs these default env. Maybe PATH.
          ...process.env,

          CARGO_TARGET_DIR: "./build/build-jawis-cargo-test",
          RUSTFLAGS: "-Awarnings",
          RUST_BACKTRACE: "1",
          RUST_LOG: "warn",
        },
        ...deps,
      })
    );

    return proc.waiter.await("stopped");
  };

  /**
   *
   */
  getProcessDeps = (
    deps: Partial<StdProcessDeps> & { filename: string }
  ): StdProcessDeps => ({
    onStdout: (data: any) => {
      console.log("child.stdout", data.toString());
    },
    onStderr: (data: any) => {
      console.log("child.stderr", data.toString());
    },
    onError: (error: any) => {
      console.log(error);
    },
    onExit: () => {},
    onClose: () => {},
    finally: this.deps.finally,
    ...deps,
  });

  /**
   * todo
   */
  public kill = () => Promise.resolve();
}

//
// util
//

/**
 *
 * notes
 *  - can't get id, because the module path is more complicated to get, than doing this line-parsing.
 */
export const parseFile = async (file: AbsoluteFile) => {
  const lines = (await fs.promises.readFile(file)).toString().split("\n");

  let next_func_is_test = false;
  let line_nr = 0;
  const res: Omit<TestInfo, "id">[] = [];

  for (const line of lines) {
    line_nr++;

    if (!next_func_is_test) {
      if (line.includes("#[test]")) {
        next_func_is_test = true;
      }
    } else {
      if (line.includes("#[ignore]")) {
        next_func_is_test = false;
      } else if (line.match(/^\s*fn ([^(]+).*$/)) {
        next_func_is_test = false;

        const funcname = line.replace(/^\s*fn ([^(]+).*$/, (_, p1) => p1);

        res.push({
          name: funcname,
          file,
          line: line_nr,
        });
      }
    }
  }

  assert(!next_func_is_test);

  return res;
};

/**
 *
 */
export const parse_stderr = async (stderr: string, folder: AbsoluteFile) => {
  const errros: ErrorData[] = [];

  let tmp_error_message = [];
  let tmp_info: CapturedValue[] = [];
  let tmp_stack_trace: ParsedStackFrame[] = [];
  let tmp_func_name: string | undefined = undefined;

  const filtered_stderr_array: string[] = [];
  let in_error_message = false;
  let in_stack_trace = false;

  for (const line of stderr.split("\n")) {
    // start of stack frame

    if (line == "stack backtrace:") {
      in_error_message = false;
      in_stack_trace = true;
      continue;
    }

    // start of error

    if (line.match(/^\s*thread '.+' panicked at/)) {
      tmp_info = [line];
      in_error_message = true;
      in_stack_trace = false;
      continue;
    }

    // end of stack frame

    if (
      line.match(
        /^note: Some details are omitted, run with `RUST_BACKTRACE=full` for a verbose backtrace\.$/
      )
    ) {
      in_error_message = false;
      in_stack_trace = false;

      errros.push({
        msg: tmp_error_message.join("\n"),
        info: tmp_info,
        stack: {
          type: "parsed",
          stack: tmp_stack_trace,
        },
      });

      tmp_error_message = [];
      tmp_info = [];
      tmp_stack_trace = [];
      tmp_func_name = undefined;

      continue;
    }

    // in error message

    if (in_error_message) {
      tmp_error_message.push(line);
      continue;
    }

    // in stack trace

    if (in_stack_trace) {
      //1. line of stack frame
      const res = line.match(/^\s*\d+: (.*)$/);

      if (res) {
        tmp_func_name = res[1];
      }

      //2. line of stack frame

      const res2 = line.match(/^\s*at\s*([^\s][^:]*):(\d*):(\d*)$/);

      if (res2) {
        const file = res2[1];
        const line = res2[2];

        tmp_stack_trace.push({
          func: tmp_func_name,
          file: path.join(folder, file),
          line: toInt(line),
        });

        tmp_func_name = undefined;
      }

      continue;
    }

    // filter noise

    if (line.match(/^error: test failed, to rerun pass `--bin xremap`$/)) {
      continue;
    }

    // it was just ordinary stderr

    filtered_stderr_array.push(line);
  }

  assert(!in_stack_trace);

  return {
    errors: errros,
    stderr: filtered_stderr_array.join("\n"),
  };
};
