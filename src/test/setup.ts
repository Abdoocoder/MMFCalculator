import '@testing-library/jest-dom/vitest';

// Node 22+ ships a global localStorage/sessionStorage that is `undefined` (or a
// non-functional stub) without --localstorage-file. In the vitest+jsdom
// environment window === globalThis, and that undefined stub shadows jsdom's real
// Storage, so any test touching localStorage throws. jsdom's own storage is
// unreachable, so install a spec-shaped in-memory Storage on the global. Instances
// inherit methods from Storage.prototype so vi.spyOn(Storage.prototype, ...) works.
const storageInstances = new WeakMap<object, Map<string, string>>();

function createMemoryStorage(): Storage {
  const instance = Object.create(Storage.prototype);
  storageInstances.set(instance, new Map<string, string>());
  return instance;
}

function getStore(instance: object): Map<string, string> {
  const store = storageInstances.get(instance);
  if (!store) throw new TypeError('Illegal invocation');
  return store;
}

const Storage = {
  prototype: {
    get length() {
      return getStore(this).size;
    },
    clear() {
      getStore(this).clear();
    },
    getItem(key: string): string | null {
      const store = getStore(this);
      return store.has(key) ? (store.get(key) as string) : null;
    },
    key(index: number): string | null {
      return Array.from(getStore(this).keys())[index] ?? null;
    },
    removeItem(key: string) {
      getStore(this).delete(key);
    },
    setItem(key: string, value: string) {
      getStore(this).set(key, String(value));
    },
  },
};

if (typeof window !== 'undefined') {
  Object.defineProperty(globalThis, 'Storage', {
    configurable: true,
    writable: true,
    value: Storage,
  });
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    writable: true,
    value: createMemoryStorage(),
  });
  Object.defineProperty(globalThis, 'sessionStorage', {
    configurable: true,
    writable: true,
    value: createMemoryStorage(),
  });
}
