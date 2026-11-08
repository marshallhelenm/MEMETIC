import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { GameProvider, GameContext } from "../GameContext";
import { MemoryRouter } from "react-router-dom";
import { WSProvider } from "../WSContext";
import * as useContextHooks from "../../hooks/useContextHooks";

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

beforeAll(() => {
  Object.defineProperty(window, "sessionStorage", {
    value: sessionStorageMock,
    writable: true,
  });
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

describe("GameContext", () => {
  it("provides default values and no error on mount", async () => {
    render(
      <MemoryRouter>
        <WSProvider>
          <GameProvider>
            <GameContext.Consumer>
              {(value) => (
                <>
                  <div data-testid="validGame">
                    {value.validGame ? "true" : "false"}
                  </div>
                  <div data-testid="error">{value.error || ""}</div>
                </>
              )}
            </GameContext.Consumer>
          </GameProvider>
        </WSProvider>
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(screen.getByTestId("validGame").textContent).toBe("false");
      expect(screen.getByTestId("error").textContent).toBe("");
    });
  });

  describe("with a mocked socket", () => {
    let ws;
    let useWSSpy;

    const tree = () => (
      <MemoryRouter initialEntries={["/play?roomKey=ABCDEFGH"]}>
        <GameProvider>
          <GameContext.Consumer>
            {(value) => (
              <>
                <div data-testid="validGame">{String(value.validGame)}</div>
                <div data-testid="gameKey">{String(value.gameKey)}</div>
              </>
            )}
          </GameContext.Consumer>
        </GameProvider>
      </MemoryRouter>
    );

    const setGameCalls = () =>
      ws.sendJsonMessage.mock.calls.filter(([m]) => m.type === "setGame");

    beforeEach(() => {
      sessionStorage.clear();
      ws = {
        sendJsonMessage: jest.fn(),
        lastJsonMessage: null,
        lastGameContentsMessage: null,
      };
      useWSSpy = jest.spyOn(useContextHooks, "useWS").mockImplementation(() => ws);
    });

    afterEach(() => useWSSpy.mockRestore());

    it("deals exactly one game for a noGameAlert, across re-renders", () => {
      const { rerender } = render(tree());

      ws = { ...ws, lastJsonMessage: { type: "noGameAlert", roomKey: "ABCDEFGH" } };
      rerender(tree());
      rerender(tree());

      expect(setGameCalls()).toHaveLength(1);
      expect(screen.getByTestId("validGame").textContent).toBe("true");
    });

    it("ignores a late noGameAlert while its own deal awaits confirmation", () => {
      const { rerender } = render(tree());

      ws = { ...ws, lastJsonMessage: { type: "noGameAlert", roomKey: "ABCDEFGH" } };
      rerender(tree());
      // A second alert answering an earlier join retry.
      ws = { ...ws, lastJsonMessage: { type: "noGameAlert", roomKey: "ABCDEFGH" } };
      rerender(tree());

      expect(setGameCalls()).toHaveLength(1);
    });

    it("deals again for a noGameAlert after the server confirmed the previous game", () => {
      const { rerender } = render(tree());

      ws = { ...ws, lastJsonMessage: { type: "noGameAlert", roomKey: "ABCDEFGH" } };
      rerender(tree());
      const [{ allKeys, columnsObject, gameKey }] = setGameCalls()[0];
      const contents = { type: "gameContents", allKeys, columnsObject, gameKey, players: {}, chatHistory: [] };
      ws = { ...ws, lastJsonMessage: contents, lastGameContentsMessage: contents };
      rerender(tree());
      // e.g. the server restarted and lost the room.
      ws = { ...ws, lastJsonMessage: { type: "noGameAlert", roomKey: "ABCDEFGH" } };
      rerender(tree());

      expect(setGameCalls()).toHaveLength(2);
    });

    it("copies game contents from the server", () => {
      const keys = Array.from({ length: 24 }, (_, i) => `meme_${i}`);
      const columnsObject = { 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {} };
      const { rerender } = render(tree());

      const contents = { type: "gameContents", allKeys: keys, columnsObject, gameKey: 7, players: {}, chatHistory: [] };
      ws = { ...ws, lastJsonMessage: contents, lastGameContentsMessage: contents };
      rerender(tree());

      expect(screen.getByTestId("validGame").textContent).toBe("true");
      expect(screen.getByTestId("gameKey").textContent).toBe("7");
      expect(setGameCalls()).toHaveLength(0);
    });
  });
});
