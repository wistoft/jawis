import { TestResult } from "./internal";

export type TestRunner = {
  runTest: (id: string, absTestFile: string) => Promise<TestResult>;
  kill: () => Promise<void>;
};
