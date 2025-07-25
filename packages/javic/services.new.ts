import { HoneyComb, MakeBee } from "^bee-common";
import { FileService, GetAbsoluteSourceFile, MainProv, SendLog } from "^jab";
import {
  MakeService,
  PluginDeclaration,
  RouteDeclaration,
  ServiceDeclaration,
} from "./internal";

export type Conf = {
  "@jawis/javi/port": number;
  "@jawis/javi/staticWebFolder": string;
  "@jawis/development/getAbsoluteSourceFile"?: GetAbsoluteSourceFile;

  "@jawis/javi/fileService/vsCodeBinary": string;
  "@jawis/javi/fileService/projectRoot": string;
  "@jawis/javi/fileService/winMergeBinary": string;

  "@jawis/javi/routes": RouteDeclaration[];
  "@jawis/javi/plugins": PluginDeclaration[];
  "@jawis/service-types": { type: string; make: MakeService<any> }[];
};

export type JaviServices = {
  "@jawis/javi/makeTsBee": MakeBee;
  "@jawis/javi/mainProv": MainProv;
  "@jawis/javi/sendLog": SendLog;
  "@jawis/javi/fileService": FileService;
  "@jawis/javi/honeyComb": HoneyComb;
};

export type JaviServicesDeclaration = {
  [T in keyof JaviServices]: ServiceDeclaration<JaviServices[T]>;
};

export type JaviServiceNew = {
  getRootConfig: <T extends keyof Conf>(name: T) => Conf[T];
  tryGetRootConfig: <T extends keyof Conf>(name: T) => Conf[T] | undefined;

  getService: <T extends keyof JaviServices>(
    name: T
  ) => Promise<JaviServices[T]>;
};
