// making it global like
import 'fake-indexeddb/auto';

// for some reason fake-indexeddb does not polyfill structuredClone
if (typeof globalThis.structuredClone === 'undefined') {
  globalThis.structuredClone = (obj: any) => JSON.parse(JSON.stringify(obj));
}
