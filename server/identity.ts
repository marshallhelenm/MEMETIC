import { createHash } from "crypto";

// A client connects with a private secret it generated itself (a UUID). Other
// players only ever see the public ID derived from it, which can't be turned
// back into the secret, so knowing someone's public ID doesn't let you connect
// as them.

const SECRET_PATTERN = /^[A-Za-z0-9-]{16,128}$/;

export function isValidSecret(secret: string | null): secret is string {
  return !!secret && SECRET_PATTERN.test(secret);
}

/** The public player ID for a secret. */
export function publicIdFor(secret: string): string {
  return createHash("sha256").update(secret).digest("hex").slice(0, 32);
}
