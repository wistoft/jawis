import { MakeBee } from "^bee-common";
import { MainProv } from "^jab-node";
import { ScriptDefinition } from "^jagos";

import { TestFrameworkDefinitionNew } from "./internal";

export type FullJaviConf = {
  siteTitle: string;
  port: number;
  removePathPrefix: string;
  phpBinary: string;
  vsCodeBinary: string;
  winMergeBinary: string;

  //unconfigurable
  projectRoot: string;
  initialShowSystemFrames: boolean;
  showClearLink: boolean;

  //jate
  absTestFolder: string;
  absTestLogFolder: string;
  tecTimeout: number;

  //jago
  scriptFolders: string[];
  scripts: ScriptDefinition[];

  serviceConf: {};

  //test frameworks
  testFrameworks: TestFrameworkDefinitionNew;
};

//
// new: config specific for javi
//

export type JaviPresetBaseConf = {
  siteTitle: string;
  port: number;
  projectRoot: string;
};

export type JaviPresetBaseProv = {
  mainProv: MainProv;
  javiConfig: JaviPresetBaseConf;
};

export type JaviPresetRecommendedConf = {
  siteTitle: string;
  port: number;
  projectRoot: string;
};

export type JaviPresetRecommendedProv = JaviPresetBaseProv & {
  honeyCombPreset: HoneyCombPreset;
};

export type HoneyCombPreset<C extends string = string> = {
  certainBees: Map<C, (preset: JaviPresetBaseProv) => MakeBee>;
  suffixBees: Map<string, (preset: JaviPresetBaseProv) => MakeBee>;
};
