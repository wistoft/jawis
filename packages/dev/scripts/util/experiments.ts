import { OnError } from "^jabc";

export type RunDeps = {
  maxtime: number;

  startScale?: number;
  increment?: number;
  maxScale?: number;
  targetTime?: number;

  prepare?: (scale: number) => any;
  runExp: (scale: number, preparation?: any) => void | Promise<void>;
};

/**
 * without promise support
 */
export const runScaleExp_new = (
  deps: Omit<RunDeps, "runExp"> & { runExp: () => void }
) =>
  runSelfScaleExp({
    ...deps,
    runExp: async (scale) => {
      for (let i = 0; i < scale; i++) {
        deps.runExp();
      }
    },
  });

/**
 * Does automatic scaling, by repeating the runExp-function `scale` amount of times.
 */
export const runScaleExp = async (
  deps: Omit<RunDeps, "runExp"> & { runExp: () => void | Promise<void> }
) =>
  runSelfScaleExp({
    ...deps,
    runExp: async (scale) => {
      for (let i = 0; i < scale; i++) {
        await deps.runExp();
      }
    },
  });

/**
 * Runs experiments with exponential increasing scale.
 *  This removes the pain of choosing an ending scale. And a step, that takes one into the interesting region fast enough.
 *
 * - targetTime is the time the experiment should have.
 * - maxtime is an upper bound for the full experiment.
 * - avoids using async/await to run faster, if not using promises
 *
 * maxtime, targetTime in milliseconds.
 */
export const runSelfScaleExp_new = (deps: RunDeps, onError?: OnError) => {
  const totalStart = Date.now();

  const start = Math.max(1, deps.startScale || 1);
  const inc = deps.increment || 2;

  const res: Map<number, number> = new Map();

  for (let i = start; ; i *= inc) {
    if (deps.maxScale && i > deps.maxScale) {
      break;
    }

    const preparation = deps.prepare && deps.prepare(i);

    const start = Date.now();

    try {
      deps.runExp(i, preparation);
    } catch (error: unknown) {
      //report error, and return data.
      if (onError) {
        onError(error);
        break;
      }
      throw error;
    }

    const now = Date.now();
    const expTime = now - start;

    res.set(i, expTime);

    if (now - totalStart > deps.maxtime) {
      break;
    }

    if (deps.targetTime && expTime > deps.targetTime) {
      break;
    }
  }

  return res;
};

/**
 * with promise support, but hard to make one function, that handles both with and without.
 */
export const runSelfScaleExp = async (deps: RunDeps, onError?: OnError) => {
  const totalStart = Date.now();

  const start = Math.max(1, deps.startScale || 1);
  const inc = deps.increment || 2;

  const res: Map<number, number> = new Map();

  for (let i = start; ; i *= inc) {
    if (deps.maxScale && i > deps.maxScale) {
      break;
    }

    const preparation = deps.prepare && deps.prepare(i);

    const start = Date.now();

    try {
      await deps.runExp(i, preparation);
    } catch (error: unknown) {
      //report error, and return data.
      if (onError) {
        onError(error, [{ i }]);
        break;
      }
      throw error;
    }

    const now = Date.now();
    const expTime = now - start;

    res.set(i, expTime);

    if (now - totalStart > deps.maxtime) {
      break;
    }

    if (deps.targetTime && expTime > deps.targetTime) {
      break;
    }
  }

  return res;
};
