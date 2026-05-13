import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

import Board from "../src/board/Board";
import * as useContextHooks from "../src/hooks/useContextHooks";

// Mock the components
jest.mock("../src/board/LoadingColumns", () => () => (
  <div>LoadingColumns Mock</div>
));
jest.mock("../src/board/CardColumns", () => () => <div>CardColumns Mock</div>);

describe("Board component", () => {
  let setLoadingCardsMock;

  beforeEach(() => {
    jest.clearAllMocks();
    setLoadingCardsMock = jest.fn();
  });

  function renderBoard({ loadingCards, gameKey }) {
    jest.spyOn(useContextHooks, "useGame").mockReturnValue({
      loadingCards,
      setLoadingCards: setLoadingCardsMock,
      gameKey,
    });

    return render(<Board />);
  }

  it("renders LoadingColumns when loadingCards is true", () => {
    renderBoard({ loadingCards: true, gameKey: "key1" });

    expect(screen.getByText("LoadingColumns Mock")).toBeInTheDocument();
  });

  it("renders CardColumns when loadingCards is false", async () => {
    renderBoard({ loadingCards: false, gameKey: "key1" });

    // Suspense fallback may render first, so wait for lazy component
    await waitFor(() => {
      expect(screen.getByText("CardColumns Mock")).toBeInTheDocument();
    });
  });

  it("calls setLoadingCards(false) when gameKey changes and loadingCards is true", async () => {
    // First render with initial gameKey and loadingCards true
    const { rerender } = renderBoard({ loadingCards: true, gameKey: "key1" });

    // Mock useGame to return updated gameKey on rerender
    jest.spyOn(useContextHooks, "useGame").mockReturnValue({
      loadingCards: true,
      setLoadingCards: setLoadingCardsMock,
      gameKey: "key2",
    });

    // Now rerender with changed gameKey but same loadingCards
    rerender(<Board />);

    // Wait for effect to run and setLoadingCards to be called
    await waitFor(() => {
      expect(setLoadingCardsMock).toHaveBeenCalledWith(false);
    });
  });

  it("does not call setLoadingCards when gameKey is same", () => {
    renderBoard({ loadingCards: true, gameKey: "key1" });

    expect(setLoadingCardsMock).not.toHaveBeenCalled();
  });
});
