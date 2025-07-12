import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

import GifPauseButton from "../src/drawer/GifPauseButton";
import * as useContextHooks from "../src/hooks/useContextHooks";

// ----- Mock sessionStorage -----
const sessionStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
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

// Helper to render component with mocked context
function renderWithContext(
  staticGifs = false,
  setStaticGifs = jest.fn(),
  drawerOpen = false
) {
  jest.spyOn(useContextHooks, "useGame").mockReturnValue({
    staticGifs,
    setStaticGifs,
  });

  return render(<GifPauseButton drawerOpen={drawerOpen} />);
}

describe("GifPauseButton", () => {
  beforeEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  test("renders with label 'Gifs'", () => {
    renderWithContext();
    expect(screen.getByLabelText("Gifs")).toBeInTheDocument();
  });

  test("switch is checked when staticGifs is false (meaning gifs playing)", () => {
    renderWithContext(false);
    const switchInput = screen.getByRole("checkbox");
    expect(switchInput).toBeChecked();
  });

  test("switch is unchecked when staticGifs is true (meaning gifs paused)", () => {
    renderWithContext(true);
    const switchInput = screen.getByRole("checkbox");
    expect(switchInput).not.toBeChecked();
  });

  test("toggleStaticGifs toggles staticGifs and updates sessionStorage", () => {
    const setStaticGifs = jest.fn();
    renderWithContext(false, setStaticGifs);

    const switchInput = screen.getByRole("checkbox");
    // Initially checked
    expect(switchInput).toBeChecked();

    // Fire click to toggle
    fireEvent.click(switchInput);

    // It should update sessionStorage with the negation of staticGifs (which was false)
    expect(window.sessionStorage.getItem("guessy-gifs")).toBe("true");

    // It should call setStaticGifs with the new value (true)
    expect(setStaticGifs).toHaveBeenCalledWith(true);
  });
});
