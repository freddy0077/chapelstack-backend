/**
 * Crypto polyfill for @nestjs/schedule compatibility
 * This file ensures the crypto module is available globally before any NestJS modules are loaded
 */

import * as nodeCrypto from 'crypto';

// Make crypto available globally for @nestjs/schedule without type conflicts
// We use 'any' to avoid conflicts with DOM crypto types
(global as any).crypto = nodeCrypto;
(globalThis as any).crypto = nodeCrypto;

// Ensure the randomUUID function is available
if (!(global as any).crypto || typeof (global as any).crypto.randomUUID !== 'function') {
  (global as any).crypto = nodeCrypto;
}

console.log('✅ Crypto polyfill loaded - crypto.randomUUID available:', typeof nodeCrypto.randomUUID === 'function');

export default nodeCrypto;
