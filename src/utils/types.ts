// check this for more https://github.com/vuejs/core/blob/main/packages/shared/src/index.ts

enum OBJECT_TYPES {
    MAP = '[object Map]',
    WEAK_MAP = '[object WeakMap]',
    SET = '[object Set]',
    WEAK_SET = '[object WeakSet]',
    DATE = '[object Date]',
    PLAIN_OBJECT = '[object Object]',
}

export const objectToString = Object.prototype.toString;

export const toTypeString = (value: unknown): string => objectToString.call(value);

export const isMap = <K, V>(value: unknown): value is Map<K, V> => toTypeString(value) === OBJECT_TYPES.MAP;

export const isWeakMap = <K extends object, V>(value: unknown): value is WeakMap<K, V> =>
    toTypeString(value) === OBJECT_TYPES.WEAK_MAP;

export const isSet = <K>(value: unknown): value is Set<K> => toTypeString(value) === OBJECT_TYPES.SET;

export const isWeakSet = <K extends object>(value: unknown): value is WeakSet<K> =>
    toTypeString(value) === OBJECT_TYPES.WEAK_SET;

export const isDate = (value: unknown): value is Date => toTypeString(value) === OBJECT_TYPES.DATE;

export const isPlainObject = (value: unknown): value is object => toTypeString(value) === OBJECT_TYPES.PLAIN_OBJECT;

export const isArray = Array.isArray;

export const isObject = (value: unknown): value is Record<any, any> => value !== null && typeof value === 'object'; // all kinds of objects
