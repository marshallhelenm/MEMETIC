import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

import Board from "../src/board/Board";
import * as useContextHooks from "../src/hooks/useContextHooks";

jest.mock("../src/board/LoadingColumns", () => () => <div>LoadingColumns Mock</div>);
jest.mock("../src/board/CardColumns", () => () => <div>CardColumns Mock</div>);

describe("Board component", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(useContextHooks, "useGame").mockReturnValue({ boardWidth: 900 } as any);
  });

  it("renders the card columns", async () => {
    render(<Board />);

    // The lazy CardColumns may show the LoadingColumns fallback first.
    await waitFor(() => {
      expect(screen.getByText("CardColumns Mock")).toBeInTheDocument();
    });
  });

  it("caps the board at boardWidth", async () => {
    const { container } = render(<Board />);

    await waitFor(() => screen.getByText("CardColumns Mock"));
    expect((container.firstChild as HTMLElement).style.width).toBe("min(100%, 900px)");
  });
});
