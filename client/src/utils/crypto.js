const enc = new TextEncoder();
const dec = new TextDecoder();

function toBase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function fromBase64(value) {
  return Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
}

export async function encryptText(plainText, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);

  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  const cipherBuffer = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plainText));

  return {
    cipherText: toBase64(cipherBuffer),
    iv: toBase64(iv),
    salt: toBase64(salt),
    algo: 'AES-GCM'
  };
}

export async function decryptText(encryptedContent, password) {
  if (!encryptedContent?.cipherText) return '';

  const salt = fromBase64(encryptedContent.salt);
  const iv = fromBase64(encryptedContent.iv);
  const cipherText = fromBase64(encryptedContent.cipherText);

  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  const plainBuffer = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipherText);
  return dec.decode(plainBuffer);
}
