/**
 * Client-side E2E Encryption Library
 * Uses Web Crypto API for secure encryption/decryption in browser
 */

// Generate random salt for new user (16 bytes = 128 bits)
export function generateSalt(): string {
  const saltBuffer = new Uint8Array(16);
  crypto.getRandomValues(saltBuffer);
  return bufferToHex(saltBuffer);
}

// Derive encryption key from password using PBKDF2
export async function deriveKeyFromPassword(
  password: string,
  saltHex: string
): Promise<CryptoKey> {
  // Convert password to buffer
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Convert hex salt to buffer
  const saltBuffer = hexToBuffer(saltHex);

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  // Derive AES-GCM key using PBKDF2
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer.buffer as ArrayBuffer, // Fix TypeScript error
      iterations: 100000, // High iteration count for security
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 }, // 256-bit AES key
    false, // not extractable
    ['encrypt', 'decrypt']
  );

  return key;
}

// Encrypt data (returns base64 encrypted data + base64 IV)
export async function encryptData(
  plaintext: string,
  key: CryptoKey
): Promise<{ encrypted: string; iv: string }> {
  // Generate random IV (12 bytes for AES-GCM)
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);

  // Convert plaintext to buffer
  const encoder = new TextEncoder();
  const plaintextBuffer = encoder.encode(plaintext);

  // Encrypt
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv.buffer as ArrayBuffer // Fix TypeScript error
    },
    key,
    plaintextBuffer.buffer as ArrayBuffer
  );

  // Convert to base64
  return {
    encrypted: bufferToBase64(new Uint8Array(encryptedBuffer)),
    iv: bufferToBase64(iv)
  };
}

// Decrypt data
export async function decryptData(
  encryptedBase64: string,
  ivBase64: string,
  key: CryptoKey
): Promise<string> {
  // Convert from base64 to buffers
  const encryptedBuffer = base64ToBuffer(encryptedBase64);
  const iv = base64ToBuffer(ivBase64);

  // Decrypt
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv.buffer as ArrayBuffer // Fix TypeScript error
    },
    key,
    encryptedBuffer.buffer as ArrayBuffer
  );

  // Convert to string
  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

// Helper: Buffer to hex string
function bufferToHex(buffer: Uint8Array): string {
  return Array.from(buffer)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Helper: Hex string to buffer
function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

// Helper: Buffer to base64
function bufferToBase64(buffer: Uint8Array): string {
  const binary = String.fromCharCode.apply(null, Array.from(buffer));
  return btoa(binary);
}

// Helper: Base64 to buffer
function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Store key in session (for current tab only)
export function storeKeyInSession(key: CryptoKey): void {
  // Note: CryptoKey cannot be directly serialized
  // We'll store a flag and keep key in React context
  sessionStorage.setItem('hasEncryptionKey', 'true');
}

// Check if key exists in session
export function hasKeyInSession(): boolean {
  return sessionStorage.getItem('hasEncryptionKey') === 'true';
}

// Clear key from session (logout)
export function clearKeyFromSession(): void {
  sessionStorage.removeItem('hasEncryptionKey');
}
