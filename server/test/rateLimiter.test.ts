import { handleMessage } from "../messageHandler";
import {
  allowMessage,
  forgetPlayer,
  resetRateLimits,
  trackedPlayerCount,
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS,
} from "../rateLimiter";

beforeEach(() => resetRateLimits());

describe("allowMessage", () => {
  it("allows up to the limit within the window, then refuses", () => {
    for (let i = 0; i < RATE_LIMIT_MAX; i++) expect(allowMessage("a", 1000)).toBe(true);
    expect(allowMessage("a", 1000)).toBe(false);
  });

  it("allows messages again once the window has passed", () => {
    for (let i = 0; i < RATE_LIMIT_MAX; i++) allowMessage("a", 1000);

    expect(allowMessage("a", 1000 + RATE_LIMIT_WINDOW_MS)).toBe(true);
  });

  it("limits each player separately", () => {
    for (let i = 0; i < RATE_LIMIT_MAX; i++) allowMessage("a", 1000);

    expect(allowMessage("b", 1000)).toBe(true);
  });

  it("forgets a player's history", () => {
    for (let i = 0; i < RATE_LIMIT_MAX; i++) allowMessage("a", 1000);

    forgetPlayer("a");

    expect(trackedPlayerCount()).toBe(0);
    expect(allowMessage("a", 1000)).toBe(true);
  });
});

describe("handleMessage rate limiting", () => {
  it("counts malformed messages too", () => {
    const send = jest.fn();
    const connections = { a: { send } };

    for (let i = 0; i < RATE_LIMIT_MAX + 1; i++) {
      handleMessage(Buffer.from("not json"), "a", null, {}, {}, connections);
    }

    const errors = send.mock.calls.map(([raw]) => JSON.parse(raw).error);
    expect(errors[errors.length - 1]).toMatch(/Rate limit exceeded/);
  });
});
