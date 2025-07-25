import { MainProv } from "^jab-node";
import { err } from "^jab";

import { safeAll } from "^yapu";
import {
  JaviService,
  Service,
  PluginDeclaration,
  RouteDeclaration,
  MakeService,
  MakeableService,
} from "./internal";

type Deps = {
  mainProv: MainProv;
  config: any;
};

/**
 *
 * todo: getRootConfig and tryGetRootConfig must throw if one tried to get a service with them.
 *        Maybe preprocess the config.
 * todo: there has to be a way to get service/config by variable. Like main-declarations.
 *        this way we don't have to use generics to get service/config typing.
 */
export const makeJaviService = (deps: Deps) => {
  const getServish = async <S>(name: string, type: string) => {
    //use servishFromDeclaration
    if (name in deps.config) {
      const decl = deps.config[name] as Service<S>;

      if (decl.type !== type) {
        throw err("Unknown " + type + " declaration: ", { name, decl });
      }

      return servishFromDeclaration(decl);
    }

    throw new Error("Unknown " + type + ": " + name);
  };

  const servishFromDeclaration = async <S>(decl: MakeableService<S>) => {
    if (!decl.instance) {
      decl.instance = await (decl as any).make(javiService);
    }

    return decl.instance!;
  };

  const javiService: JaviService = {
    getRootConfig: <T>(name: string) => {
      if (name in deps.config) {
        return deps.config[name] as T;
      }

      throw new Error("Unknown config: " + name);
    },

    tryGetRootConfig: <T>(name: string) => deps.config[name] as T,

    resolveService: <T>(service: T | string) =>
      typeof service !== "string"
        ? Promise.resolve(service)
        : javiService.getService<T>(service),

    getService: <T>(name: string) => getServish<T>(name, "service"),

    getServiceType: <T>(type: string) => {
      const types = javiService.getRootConfig<
        { type: string; make: MakeService<T> }[]
      >("@jawis/service-types");

      const proms = types
        .filter((decl) => decl.type === type)
        .map((decl) => servishFromDeclaration(decl));

      const res = safeAll(proms, deps.mainProv.onError);

      return res;
    },

    servishFromDeclaration,
  };

  //
  // plugins
  //

  const plugins = deps.config["@jawis/javi/plugins"] as PluginDeclaration[]; // prettier-ignore

  const serverRouteDecls = deps.config["@jawis/javi/routes"] as RouteDeclaration[]; // prettier-ignore

  for (const decl of plugins ?? []) {
    const plugin = decl.make(deps.config);

    if (plugin.service) {
      deps.config[decl.name] = plugin.service;
    }

    if (plugin.router) {
      serverRouteDecls.push(plugin.router);
    }
  }

  return { javiService, serverRouteDecls };
};
