import { isValidSecret, publicIdFor } from "../identity";

describe("player identity", () => {
  const secret = "3f1c2b7e-9a4d-4e0b-8c1a-5d6e7f809a1b";

  it("derives the same public ID from the same secret", () => {
    expect(publicIdFor(secret)).toBe(publicIdFor(secret));
  });

  it("derives different public IDs from different secrets", () => {
    expect(publicIdFor(secret)).not.toBe(publicIdFor(secret.replace("3f", "4f")));
  });

  it("doesn't reveal the secret in the public ID", () => {
    expect(publicIdFor(secret)).not.toContain(secret.slice(0, 8));
    expect(publicIdFor(secret)).toMatch(/^[0-9a-f]{32}$/);
  });

  it.each([
    [secret, true],
    ["short", false],
    ["", false],
    [null, false],
    ["has spaces in it which is not allowed", false],
    ["x".repeat(129), false],
  ])("treats %p as a valid secret: %p", (value, valid) => {
    expect(isValidSecret(value as string | null)).toBe(valid);
  });
});
