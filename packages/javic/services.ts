export type JaviService = {
  getRootConfig: <T>(name: string) => T;
  tryGetRootConfig: <T>(name: string) => T | undefined;

  resolveService: <T>(name: T | string) => Promise<T>;

  getService: <T>(name: string) => Promise<T>;

  servishFromDeclaration: <T>(
    decl: Service<T>,
    type?: string,
    name?: string
  ) => Promise<T>;

  getServiceType: <T>(type: string) => Promise<T[]>;
};

export type MakeService<S = unknown> = (
  javiService: JaviService
) => Promise<S> | S;

export type ServiceDeclaration<S = unknown> =
  | {
      type: "service";
      instance: S;
    }
  | {
      type: "service";
      make: MakeService<S>;
    };

export type Service<S = unknown> =
  | {
      type: "service";
      instance: S;
    }
  | {
      type: "service";
      make: MakeService<S>;
      instance?: S;
    };

export type MakeableService<S = unknown> =
  | {
      instance: S;
    }
  | {
      make: MakeService<S>;
      instance?: S;
    };

//
// router service
//

export type RouteDeclaration = {
  path: string;
  make: RouterService;
};

export type RouterService = (javiService: JaviService) => Promise<any> | any;
// how to make return to this type??
// Promise<express.Router> | express.Router;

export type Plugin<S> = {
  service?: ServiceDeclaration<S>;
  router?: RouteDeclaration;
};

export type PluginDeclaration<S = unknown> = {
  name: string;
  make: (serviceConfig: any) => Plugin<S>;
};
