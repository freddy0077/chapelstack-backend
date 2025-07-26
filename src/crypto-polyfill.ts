/**
 * Crypto polyfill for @nestjs/schedule compatibility
 * This file ensures the crypto module is available globally before any NestJS modules are loaded
 */

import * as nodeCrypto from 'crypto';

// Check if crypto is already available
const hasCrypto = typeof (global as any).crypto !== 'undefined';
const hasRandomUUID = hasCrypto && typeof (global as any).crypto.randomUUID === 'function';

console.log('🔍 Crypto polyfill check:', { hasCrypto, hasRandomUUID });

// Only polyfill if crypto is not available or missing randomUUID
if (!hasCrypto || !hasRandomUUID) {
  try {
    // Try to define crypto property using Object.defineProperty (Node.js v20 compatible)
    Object.defineProperty(global, 'crypto', {
      value: nodeCrypto,
      writable: false,
      enumerable: true,
      configurable: true
    });
    console.log('✅ Crypto polyfill applied using Object.defineProperty');
  } catch (error) {
    console.warn('⚠️ Could not set global.crypto via Object.defineProperty:', error.message);
    
    // Fallback: try direct assignment for older Node.js versions
    try {
      (global as any).crypto = nodeCrypto;
      console.log('✅ Crypto polyfill applied using direct assignment');
    } catch (fallbackError) {
      console.warn('⚠️ Could not set global.crypto via direct assignment:', fallbackError.message);
      
      // Final fallback: ensure globalThis has crypto
      try {
        (globalThis as any).crypto = nodeCrypto;
        console.log('✅ Crypto polyfill applied to globalThis');
      } catch (globalThisError) {
        console.error('❌ All crypto polyfill methods failed:', globalThisError.message);
      }
    }
  }
} else {
  console.log('✅ Crypto already available globally');
}

// Verify the polyfill worked
const finalCheck = typeof (global as any).crypto?.randomUUID === 'function';
console.log('🎯 Final crypto check - randomUUID available:', finalCheck);

export default nodeCrypto;
