import { CompilerOptions } from "typescript";
import { ModuleKind } from "ts-morph";
import { TestProvision } from "^jarun";
import {
  TsCompileServiceNonIncremental,
  TsCompileServiceIncremental,
} from "^misc/tscs";

/**
 *
 */
export const getTsCompileServiceNonIncremental = (prov: TestProvision) => {
  const options: CompilerOptions = {
    module: ModuleKind.Node16,
  };

  return new TsCompileServiceNonIncremental({ options, onTsError: prov.imp });
};

/**
 *
 */
export const getTsCompileServiceIncremental = (prov: TestProvision) => {
  const options: CompilerOptions = { module: ModuleKind.Node16 };

  return new TsCompileServiceIncremental({ options, onTsError: prov.imp });
};
