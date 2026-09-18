import { scrypt, randomBytes, timingSafeEqual } from "crypto";

const N = 16384, r = 8, p = 1, KEYLEN = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = await new Promise<Buffer>((resolve, reject) =>
    scrypt(password, salt, KEYLEN, { N, r, p }, (err, key) => (err ? reject(err) : resolve(key))),
  );
  return `s1:${salt}:${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [ver, salt, hex] = stored.split(":");
    if (ver !== "s1" || !salt || !hex) return false;
    const expected = Buffer.from(hex, "hex");
    const actual = await new Promise<Buffer>((resolve, reject) =>
      scrypt(password, salt, KEYLEN, { N, r, p }, (err, key) => (err ? reject(err) : resolve(key))),
    );
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}
