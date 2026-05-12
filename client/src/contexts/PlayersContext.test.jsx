import React from "react";
import { render, screen } from "@testing-library/react";
import { PlayersProvider, PlayersContext } from "./PlayersContext";

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
});

describe("PlayersContext", () => {
  it("provides default values and no error on mount", () => {
    render(
      <PlayersProvider>
        <PlayersContext.Consumer>
          {(value) => (
            <>
              <div data-testid="myPlayerCard">{value.myPlayerCard || ""}</div>
              <div data-testid="error">{value.error || ""}</div>
            </>
          )}
        </PlayersContext.Consumer>
      </PlayersProvider>,
    );
    expect(screen.getByTestId("error").textContent).toBe("");
  });
});
