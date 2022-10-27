import { err, JabError } from ".";

/**
 *
 */
export const isPlainObject = (value: {}): boolean =>
  value.constructor === Object &&
  Object.getPrototypeOf(value) === Object.prototype;

/**
 *
 */
export const isUndefined = (value: unknown): value is undefined =>
  value === undefined;

/**
 *
 */
export const isBoolean = (value: unknown): value is boolean =>
  typeof value === "boolean";

/**
 *
 * - type is unknown. But only value of type number is considered. No type juggling.
 */
export const isInt = (value: unknown): value is number =>
  typeof value === "number" && value % 1 === 0;

/**
 *
 */
export const isIntString = (value: unknown): value is number =>
  typeof value === "string" && +value % 1 === 0 && value === "" + +value;

/**
 *
 */
export const isString = (value: unknown): value is string =>
  typeof value === "string";

/**
 *
 */
export const isArray = (value: unknown): value is Array<unknown> =>
  Array.isArray(value);

/**
 *
 */
export const isObject = (value: unknown): value is { [_: string]: unknown } =>
  typeof value === "object" && value !== null;

/**
 *
 * - The `in` operator can't be used with all values. This can.
 */
export const hasProp = (value: unknown, propertyName: string | number) =>
  typeof value === "object" && value !== null && propertyName in value;

//
// assert the value is something, and return it.
//

/**
 *
 */
export const assertHelper = <T>(
  value: unknown,
  predicate: (value: unknown) => value is T,
  defaultMsg: string,
  msg?: string
) => {
  if (predicate(value)) {
    return value;
  }

  if (msg) {
    throw new Error(msg);
  } else {
    throw new JabError(defaultMsg, value);
  }
};

/**
 *
 */
export const assertInt = (value: unknown, msg?: string) =>
  assertHelper(value, isInt, "Not integer:", msg);

/**
 *
 */
export const assertIntString = (value: unknown, msg?: string) =>
  assertHelper(value, isIntString, "Not integer string:", msg);

/**
 *
 */
export const assertString = (value: unknown, msg?: string) =>
  assertHelper(value, isString, "Not string:", msg);

/**
 * - The type parameter is just a type assertation. It's not guaranteed at runtime.
 */
export const assertArray = <T>(value: unknown, msg?: string) =>
  assertHelper(value, isArray, "Not string:", msg) as T[];

/**
 *
 */
export const assertProp = <T>(
  value: unknown,
  propertyName: string | number,
  msg?: string,
  predicate?: (value: unknown) => value is T,
  propertyType?: string
): T => {
  if (!hasProp(value, propertyName)) {
    if (msg) {
      throw new Error(msg);
    } else {
      throw new JabError("Failed to find: " + propertyName + " in:", value);
    }
  }

  //check the type

  const prop = (value as any)[propertyName] as T;

  if (predicate === undefined || predicate(prop)) {
    return prop;
  }

  if (msg) {
    throw new Error(msg);
  } else {
    throw new JabError(
      "Property must be " + propertyType + ". " + propertyName + " in:",
      value
    );
  }
};

/**
 *
 */
export const assertPropInt = (
  value: unknown,
  propertyName: string | number,
  msg?: string
) => assertProp(value, propertyName, msg, isInt, "integer");

/**
 *
 */
export const assertPropBoolean = (
  value: unknown,
  propertyName: string | number,
  msg?: string
) => assertProp(value, propertyName, msg, isBoolean, "boolean");

/**
 *
 */
export const assertPropString = (
  value: unknown,
  propertyName: string | number,
  msg?: string
) => assertProp(value, propertyName, msg, isString, "string");

/**
 *
 */
export const intersect =
  <A, B>(
    a: (value: unknown) => value is A,
    b: (value: unknown) => value is B
  ) =>
  (value: unknown) => {
    if (a(value) || b(value)) {
      return value;
    } else {
      throw err("intersect failed for: ", value);
    }
  };

/**
 * - return undefined if not an object
 * - return undefined if property doesn't exist.
 * - If there is no predicate, then the type parameter is just a type assertation. It's not guaranteed at runtime.
 */
export const tryProp = <T>(
  value: unknown,
  propertyName: string | number,
  predicate?: (value: unknown) => value is T
) => {
  if (hasProp(value, propertyName)) {
    const prop = (value as any)[propertyName];

    if (predicate === undefined || predicate(prop)) {
      return prop as T;
    }
  }
};

/**
 *
 */
export const tryPropString = (value: unknown, propertyName: string | number) =>
  tryProp(value, propertyName, isString);

/**
 *
 */
export const undefinedOr = <A>(a: (value: unknown) => value is A) =>
  intersect(isUndefined, a);

//
// convert to something else.
//

/**
 *
 * - returns null if it's not a string.
 */
export const tryToInt = (value: string) => (isIntString(value) ? +value : null);

/**
 *
 */
export const toInt = (value: string) => (assertIntString(value), +value);
