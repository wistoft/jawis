import { TestProvision } from "^jarun";
import { onPrevUpdater } from "^jatev/updaters";
import { defaultJatevState, getStateWithZeroTests } from "../_fixture";

export default ({ imp }: TestProvision) => {
  imp(onPrevUpdater(() => 1)(defaultJatevState));
  imp(onPrevUpdater(() => 1)(getStateWithZeroTests()));
};
