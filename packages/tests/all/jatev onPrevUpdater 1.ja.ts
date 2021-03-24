import { TestProvision } from "^jarun";
import { onPrevUpdater } from "^jatev/updaters";
import { defaultState, stateWithZeroTests } from "../_fixture";

export default ({ imp }: TestProvision) => {
  imp(onPrevUpdater(() => 1)(defaultState));
  imp(onPrevUpdater(() => 1)(stateWithZeroTests));
};
