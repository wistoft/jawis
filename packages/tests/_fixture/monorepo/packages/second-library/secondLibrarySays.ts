import eq from "deep-equal";
import fse from "fs-extra";
import { firstLibrarySays } from "^first-library";

export const secondLibrarySays = (): void => {
  console.log("secondLibrarySays");
};

export const useTheDependency = (): void => {
  console.log(eq(1, 2));
};

export const useTheDependency2 = (): void => {
  fse.rmdirSync("");
};

export const useSiblingDependency = (): void => {
  firstLibrarySays();
};
