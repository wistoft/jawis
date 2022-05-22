import { isNode } from ".";

declare const global: any;

const __jawis_frozen_classes = "__jawis_frozen_classes";

/**
 * Fix inheritance when inheriting from native classes in node.js.
 *
 */
export const fixErrorInheritance = (obj: {}, cls: {} | null) => {
  if (isNode()) {
    Object.setPrototypeOf(obj, cls);
  }
};

/**
 * The prototype chain is returned as an array of names.
 */
export const getProtoChain = (obj: {}) => {
  const res: string[] = [];
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const proto = Object.getPrototypeOf(obj);
    if (proto === null) {
      res.push("null");
      return res;
    } else if (
      proto === Object.prototype &&
      proto.constructor.name === "Object"
    ) {
      res.push("Object");
      return res;
    } else {
      res.push(proto.constructor.name);
      // dive down
      obj = proto;
    }
  }
};

/**
 *
 * - Simplied version of what TypeScript uses for downleveling classes to ES5
 * - Remember in constructor: Call super, and use returned value as `this`, and return `this`.
 *
 * note: shouldn't this contruct the a super instance?
 */
export function extend(_child: object, _super: object) {
  if (typeof _super !== "function" && _super !== null)
    throw new TypeError(
      "Class extends value " + String(_super) + " is not a constructor"
    );

  Object.setPrototypeOf(_child, _super);

  function PrototypeObject(this: any) {
    this.constructor = _child;
  }

  PrototypeObject.prototype = _super.prototype;

  (_child as any).prototype = new (PrototypeObject as any)();
}

/**
 * ufærdig
 */
export const shallowExtend = <B, T extends new (...args: any[]) => B>(
  parent: T,
  extend: (instance: B) => T
) => {
  return function (...args: any[]) {
    const e = new parent(...args);

    return extend(e);
  };
};

/**
 * Call this to ensure a global classes isn't replaced.
 *
 *  - It's okay if the class has been replaced already.
 */
export function freezeGlobalClass(_class: string) {
  if (!global[__jawis_frozen_classes]) {
    global[__jawis_frozen_classes] = {};
  }

  global[__jawis_frozen_classes][_class] = true;
}

/**
 *
 */
export function replaceGlobalClass(_original: string, _new: any) {
  if (
    global[__jawis_frozen_classes] &&
    global[__jawis_frozen_classes][_original]
  ) {
    throw new Error("Class is frozen: " + _original);
  }

  _new._originalGlobalClass = global[_original];
  global[_original] = _new;
}

/**
 *
 */
export function restoreGlobalClass(_original: string, _new: any) {
  if (
    global[__jawis_frozen_classes] &&
    global[__jawis_frozen_classes][_original]
  ) {
    throw new Error("Class is frozen: " + _original);
  }

  if (_new !== global[_original]) {
    throw new Error(
      "The given class isn't the global now, class: " + _original
    );
  }

  global[_original] = _new._originalGlobalClass;
}

/**
 * Replaces the `instanceof` operator when `replaceGlobalClass` has been used.
 */
export function isInstanceOf<T extends new (...args: any) => any>(
  obj: any,
  parent: T
): obj is InstanceType<T> {
  let original = parent as any;

  while (original._originalGlobalClass) {
    original = original._originalGlobalClass;
  }

  return obj instanceof original;
}
