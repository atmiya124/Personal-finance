// Polyfill fetch for Node.js
if (!globalThis.fetch) {
  // @ts-ignore
  globalThis.fetch = require('node-fetch');
}
