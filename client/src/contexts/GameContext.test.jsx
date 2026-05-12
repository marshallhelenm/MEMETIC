import React from "react";
import { render, screen } from "@testing-library/react";
import { GameProvider, GameContext } from "./GameContext";
import { MemoryRouter } from "react-router-dom";
import { WSProvider } from "./WSContext";

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
  it("provides default values and no error on mount", () => {
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
    expect(screen.getByTestId("validGame").textContent).toBe("false");
    expect(screen.getByTestId("error").textContent).toBe("");
  });
});
