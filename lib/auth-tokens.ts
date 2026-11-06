export interface SessionUser {
  id: string;
  name: string | null;
  username: string | null;
  email: string;
  role: string;
}

export interface SessionPayload extends SessionUser {
  exp: number;
}

export const AUTH_COOKIE_NAME = "auth_token";

const DEFAULT_SECRET = "licao-de-casa-segredo-super-seguro-2026";

function getSecretKey(): string {
  return process.env.AUTH_SECRET || DEFAULT_SECRET;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlToBytes(str: string): Uint8Array {
  let b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Assina um payload com HMAC-SHA256 gerando um token seguro no formato: base64Payload.base64Signature
 */
export async function signToken(
  user: SessionUser,
  expiresInSeconds: number
): Promise<string> {
  const payload: SessionPayload = {
    ...user,
    exp: Date.now() + expiresInSeconds * 1000,
  };

  const enc = new TextEncoder();
  const encodedPayload = enc.encode(JSON.stringify(payload));
  const key = await getCryptoKey(getSecretKey());
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encodedPayload);

  const payloadB64 = bytesToBase64Url(encodedPayload);
  const sigB64 = bytesToBase64Url(new Uint8Array(signatureBuffer));

  return `${payloadB64}.${sigB64}`;
}

/**
 * Valida o token e retorna o usuário da sessão caso seja válido e não expirado.
 */
export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [payloadB64, sigB64] = parts;
    const payloadBytes = base64UrlToBytes(payloadB64);
    const signatureBytes = base64UrlToBytes(sigB64);

    const key = await getCryptoKey(getSecretKey());
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes as unknown as BufferSource,
      payloadBytes as unknown as BufferSource
    );

    if (!isValid) return null;

    const dec = new TextDecoder();
    const payload: SessionPayload = JSON.parse(dec.decode(payloadBytes));

    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }

    return {
      id: payload.id,
      name: payload.name,
      username: payload.username,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
}
