export type RunDeps = {
  maxtime: number;

  startScale?: number;
  increment?: number;
  targetTime?: number;

  runExp: (scale: number) => void | Promise<void>;
};

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
 *
 * maxtime, targetTime in milliseconds.
 */
export const runSelfScaleExp = async (deps: RunDeps) => {
  const totalStart = Date.now();

  const start = Math.max(1, deps.startScale || 1);
  const inc = deps.increment || 2;

  const res: Map<number, number> = new Map();

  for (let i = start; ; i *= inc) {
    const start = Date.now();

    await deps.runExp(i);

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
