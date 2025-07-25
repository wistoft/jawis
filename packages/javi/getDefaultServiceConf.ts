import { MainProv, SendLog } from "^jab";
import { makePhpBee } from "^bee-php";
import { jagosRouterService } from "^jagos";
import { makeBrowserBeeFrostPlugin } from "^jabro";
import { makeWebCsRoutePlugin } from "^webcs";
import {
  FullJaviConf,
  makeTsBeeService,
  makeFileService,
  jatesRouterService,
  honeyCombService,
  makeCommandBee,
  makeWebpackCompileService,
  makeGoBee,
  JaviServicesDeclaration,
  Conf,
} from "./internal";

type Deps = {
  conf: FullJaviConf;
  staticWebFolder: string;
  sendLog: SendLog;
  mainProv: MainProv;
};

/**
 *
 */
export const getDefaultServiceConf = (deps: Deps) => ({
  ...confToServiceConf(deps),
  ...getJaviDefaultConf(deps),
  ...getJaviDefaultServices(deps),
});

/**
 *
 */
const confToServiceConf = (deps: Deps) => ({
  ...deps.conf.serviceConf, //todo: we must find a way to merge this with the conf below

  // how to decouple from javi
  "@jawis/jates/absJarunTestLogFolder": deps.conf.absTestLogFolder,
  "@jawis/jates/absJarunTestFolders": [deps.conf.absTestFolder],
  "@jawis/jates/tecTimeout": deps.conf.tecTimeout,

  // how to decouple from javi
  "@jawis/jagos/scriptFolders": deps.conf.scriptFolders,
  "@jawis/jagos/scripts": deps.conf.scripts,

  "@jawis/javi/honeyComb/certainBees": {
    ts: "@jawis/javi/makeTsBee",

    //quick fix - these should be configurable in javi.conf
    ww: "@jawis/makeBrowserBee",
  },

  "@jawis/javi/honeyComb/suffixBees": {
    //quick fix - these should be configurable in javi.conf
    ".ww.js": "@jawis/makeBrowserBee",
    ".ww.ts": "@jawis/makeBrowserBee",
    ".cmd": makeCommandBee,
    ".php": makePhpBee,
    ".go": makeGoBee,
  },

  "@jawis/compileService": { type: "service", make: makeWebpackCompileService }, // prettier-ignore
});

/**
 *
 */
const getJaviDefaultConf = (deps: Deps): Conf => ({
  "@jawis/javi/port": deps.conf.port,

  //how to make this read-only
  "@jawis/javi/staticWebFolder": deps.staticWebFolder,

  "@jawis/javi/fileService/vsCodeBinary": deps.conf.vsCodeBinary,
  "@jawis/javi/fileService/projectRoot": deps.conf.projectRoot,
  "@jawis/javi/fileService/winMergeBinary": deps.conf.winMergeBinary,

  "@jawis/javi/routes": [
    { path: "/jate", make: jatesRouterService },
    { path: "/jago", make: jagosRouterService },
  ],

  "@jawis/javi/plugins": [
    //quick fix - these should be configurable in javi.conf
    { name: "@jawis/webcs", make: makeWebCsRoutePlugin },
    { name: "@jawis/makeBrowserBee", make: makeBrowserBeeFrostPlugin },
  ],

  "@jawis/service-types": [],
  // "@jawis/service-types": [javiJateBehat, javiJatePhpUnit],
});

/**
 *
 */
const getJaviDefaultServices = (deps: Deps): JaviServicesDeclaration => ({
  "@jawis/javi/makeTsBee": { type: "service", make: makeTsBeeService },
  "@jawis/javi/mainProv": { type: "service", make: () => deps.mainProv },
  "@jawis/javi/sendLog": { type: "service", instance: deps.sendLog },
  "@jawis/javi/fileService": { type: "service", make: makeFileService },
  "@jawis/javi/honeyComb": { type: "service", make: honeyCombService },
});
