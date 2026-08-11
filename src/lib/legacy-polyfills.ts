/**
 * Polyfills para WebViews antigas (tablets Android, Fully Kiosk Browser).
 * Precisa ser importado antes do restante da aplicação.
 */
const g = globalThis as unknown as Record<string, unknown>;

if (!(Array.prototype as unknown as { at?: unknown }).at) {
  const at = function (this: unknown[], index: number) {
    const i = Math.trunc(index) || 0;
    return this[i < 0 ? this.length + i : i];
  };
  Object.defineProperty(Array.prototype, "at", { value: at, configurable: true, writable: true });
  Object.defineProperty(String.prototype, "at", {
    value: function (this: string, index: number) {
      const i = Math.trunc(index) || 0;
      return this[i < 0 ? this.length + i : i];
    },
    configurable: true,
    writable: true,
  });
}

if (!(String.prototype as unknown as { replaceAll?: unknown }).replaceAll) {
  Object.defineProperty(String.prototype, "replaceAll", {
    value: function (this: string, search: string | RegExp, replacement: string) {
      if (search instanceof RegExp) return this.replace(search, replacement as never);
      return this.split(search).join(replacement);
    },
    configurable: true,
    writable: true,
  });
}

if (!(Object as unknown as { hasOwn?: unknown }).hasOwn) {
  Object.defineProperty(Object, "hasOwn", {
    value: (obj: object, key: PropertyKey) => Object.prototype.hasOwnProperty.call(obj, key),
    configurable: true,
    writable: true,
  });
}

if (typeof g["structuredClone"] !== "function") {
  g["structuredClone"] = (value: unknown) =>
    value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

if (!(Array.prototype as unknown as { flatMap?: unknown }).flatMap) {
  Object.defineProperty(Array.prototype, "flatMap", {
    value: function (this: unknown[], fn: (v: unknown, i: number, a: unknown[]) => unknown) {
      return this.reduce<unknown[]>((acc, v, i, a) => {
        const r = fn(v, i, a);
        return acc.concat(Array.isArray(r) ? r : [r]);
      }, []);
    },
    configurable: true,
    writable: true,
  });
}

if (typeof Promise !== "undefined" && !(Promise as unknown as { allSettled?: unknown }).allSettled) {
  (Promise as unknown as { allSettled: unknown }).allSettled = (promises: Promise<unknown>[]) =>
    Promise.all(
      Array.from(promises).map((p) =>
        Promise.resolve(p).then(
          (value) => ({ status: "fulfilled", value }),
          (reason) => ({ status: "rejected", reason }),
        ),
      ),
    );
}

export {};
