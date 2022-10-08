import isBuiltinModule from "is-builtin-module";

type Deps = {
  require: any;
  __importStar: any;
  __importDefault: any;
};

const __requireOriginalModule = "__requireOriginalModule"; //used to bypass the proxy.

let disabled = false;

/**
 *
 * - Wrapper for node's require function.
 * - A custom wrapper is made for `require` in every module, that should lazy require.
 * - Also wrappers for typescripts magic functions. They would otherwise cause the module to load right away.
 *
 * note
 *  - Only tested for files emitted from TypeScript.
 *
 */
export const lazyRequire = (original: Deps) => {
  //make the require proxy

  const require = makeRequire(original);

  //to allow eager load, if needed

  (require as any).eager = original.require;

  //preserve properties on require

  Object.keys(original.require).forEach((key) => {
    (require as any)[key] = original.require[key];
  });

  //provision

  return {
    require,
    __importStar: makeTypeScriptDelayer(original.__importStar),
    __importDefault: makeTypeScriptDelayer(original.__importDefault),
    original,
  };
};

/**
 *
 * notes
 *  - this proxy is only used, when TypeScript doesn't wrap require.
 */
const makeRequire = (original: Deps) => (id: string, ...args: any[]) => {
  //no need to lazy load native node modules.

  if (disabled || isBuiltinModule(id)) {
    return original.require(id, ...args);
  }

  let module: any;

  const ensureLoaded = () => {
    if (!module) {
      module = original.require(id, ...args);
    }
  };

  //must be classic function, to be constructable with `new`.
  function func(...args: any[]) {
    ensureLoaded();

    //for `module.exports = function`
    return module(...args);
  }

  return new Proxy(func, {
    get: function (target, name) {
      ensureLoaded();

      if (name === __requireOriginalModule) {
        // the wrapper is asking for the original module, so this proxy is not used at all.
        return module;
      }

      return module[name];
    },

    ownKeys: () => {
      ensureLoaded();

      const res = [...Reflect.ownKeys(func), ...Reflect.ownKeys(module)];

      //not sure this is the proper way to include the properties, that the proxy has.
      return Array.from(new Set(res));
    },

    getOwnPropertyDescriptor: (target, property) => {
      ensureLoaded();

      if (
        property === "prototype" ||
        property === "length" ||
        property === "name"
      ) {
        // must be so, because the proxy has those extra properties.
        return Reflect.getOwnPropertyDescriptor(func, property);
      }

      const descriptor = Reflect.getOwnPropertyDescriptor(module, property);

      if (descriptor) {
        //ensure the proxy is in line with the module. With respect to writable properties.
        Reflect.defineProperty(target, property, descriptor);
      }

      return descriptor;
    },

    //should this also return true for properties in the proxy??
    has: (target, p) => {
      ensureLoaded();

      return p in module;
    },

    construct: (target, args) => {
      ensureLoaded();

      //for `module.exports = class`
      return new module(...args);
    },

    isExtensible: () => { throw new Error("not supported");}, // prettier-ignore
    defineProperty: () => { throw new Error("not supported");}, // prettier-ignore
    deleteProperty: () => { throw new Error("not supported");}, // prettier-ignore
    preventExtensions: () => { throw new Error("not supported");}, // prettier-ignore
    set: () => { throw new Error("not supported");}, // prettier-ignore
    setPrototypeOf: () => { throw new Error("not supported");}, // prettier-ignore
  });
};

/**
 * Purpose: Delay call to TypeScript wrapper. Because they access modules properties, and would cause module to load.
 */
const makeTypeScriptDelayer = (originalTypeScriptWrapper: any) => (
  moduleProxy: any
) => {
  //by pass the require-proxy, if it's there. It has no purpose, now.
  const getModule = () =>
    originalTypeScriptWrapper(
      moduleProxy.__requireOriginalModule
        ? moduleProxy.__requireOriginalModule
        : moduleProxy
    );

  if (disabled) {
    // when disabled, the require isn't installed, so `moduleProxy` is the original module here.
    return getModule();
  }

  let module: any;

  return new Proxy(
    {},
    {
      get: function (target, name) {
        if (!module) {
          module = getModule();
        }

        return module[name];
      },

      getOwnPropertyDescriptor: () => { throw new Error("not impl");}, // prettier-ignore
      getPrototypeOf: () => { throw new Error("not impl");}, // prettier-ignore
      ownKeys: () => { throw new Error("not impl");}, // prettier-ignore
      has: () => { throw new Error("not impl");}, // prettier-ignore

      isExtensible: () => { throw new Error("not supported");}, // prettier-ignore
      apply: () => { throw new Error("not supported");}, // prettier-ignore
      construct: () => { throw new Error("not supported");}, // prettier-ignore
      defineProperty: () => { throw new Error("not supported");}, // prettier-ignore
      deleteProperty: () => { throw new Error("not supported");}, // prettier-ignore
      preventExtensions: () => { throw new Error("not supported");}, // prettier-ignore
      set: () => { throw new Error("not supported");}, // prettier-ignore
      setPrototypeOf: () => { throw new Error("not supported");}, // prettier-ignore
    }
  );
};

/**
 * for source code generation
 *
 * todo: proper js-escape of filename
 */
export const makePrefixCode = () =>
  `const __lazyRequire = require("${__filename.replace(/\\/g, "/")}");
const lazy = __lazyRequire.lazyRequire({ require, __importStar, __importDefault });
require = lazy.require;
var { __importStar, __importDefault } = lazy;
`.replace(/\n/g, ""); /*remove newlines, so source map isn't affected.*/

/**
 * bug: need the same module to disable.
 */
export const lazyRequireDisable = () => {
  disabled = true;
};

/**
 * useful, when lazy require should be disabled for a single require call.
 *
 * - lazy require will remain active transitively.
 *
 * note
 *  to be compatible with webpack, use this: `eval("require.eager || require")`
 */
export const eagerRequire = (require: any, id: any) =>
  (require.eager || require)(id);
