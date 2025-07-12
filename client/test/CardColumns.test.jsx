import React from "react";
import { render, screen } from "@testing-library/react";
import * as reactRouterDom from "react-router-dom";

import * as useContextHooks from "../src/hooks/useContextHooks";
import CardColumns from "../src/board/CardColumns";
import * as memeCollection from "../src/assets/memeCollection";

// Mock the child components
jest.mock("../src/card/MissingStub", () => () => (
  <div data-testid="MissingStub" />
));
jest.mock("../src/card/StubCard", () => ({ itemKey, roomKey }) => (
  <div data-testid={`StubCard-${itemKey}`} data-roomkey={roomKey}>
    {itemKey}
  </div>
));
jest.mock("../src/board/BoardColumn", () => ({ cards }) => (
  <div data-testid="BoardColumn">{cards}</div>
));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useSearchParams: jest.fn(),
}));

describe("CardColumns", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correct number of BoardColumn components", () => {
    // Mock useGame
    jest.spyOn(useContextHooks, "useGame").mockReturnValue({
      columns: {
        1: ["item1", "item2"],
        2: ["item3"],
      },
    });

    // Mock useSearchParams
    reactRouterDom.useSearchParams.mockReturnValue([
      new URLSearchParams("roomKey=testRoom"),
    ]);

    // Mock memeData so all items exist
    memeCollection.memeData = {
      item1: { title: "Meme1" },
      item2: { title: "Meme2" },
      item3: { title: "Meme3" },
    };

    render(<CardColumns />);

    // Should render 2 BoardColumn components
    const columns = screen.getAllByTestId("BoardColumn");
    expect(columns).toHaveLength(2);

    // Each StubCard should have correct roomKey
    expect(screen.getByTestId("StubCard-item1")).toHaveAttribute(
      "data-roomkey",
      "testRoom"
    );
    expect(screen.getByTestId("StubCard-item2")).toHaveAttribute(
      "data-roomkey",
      "testRoom"
    );
    expect(screen.getByTestId("StubCard-item3")).toHaveAttribute(
      "data-roomkey",
      "testRoom"
    );
  });

  it("renders MissingStub for missing memeData", async () => {
    // Columns include an invalid itemKey
    jest.spyOn(useContextHooks, "useGame").mockReturnValue({
      columns: {
        1: ["validItem", "missingItem"],
      },
    });

    reactRouterDom.useSearchParams.mockReturnValue([
      new URLSearchParams("roomKey=abc123"),
    ]);

    // memeData only has one valid item
    memeCollection.memeData = {
      validItem: { title: "Valid" },
    };

    render(<CardColumns />);

    // Should render one BoardColumn
    await screen.findAllByTestId("BoardColumn");
    expect(screen.getAllByTestId("BoardColumn")).toHaveLength(1);

    // Should have one StubCard and one MissingStub inside
    expect(screen.getByTestId("StubCard-validItem")).toBeInTheDocument();
    expect(screen.getByTestId("MissingStub")).toBeInTheDocument();
  });

  it("renders nothing if columns are empty", () => {
    jest.spyOn(useContextHooks, "useGame").mockReturnValue({
      columns: {},
    });

    reactRouterDom.useSearchParams.mockReturnValue([new URLSearchParams()]);

    memeCollection.memeData = {};

    render(<CardColumns />);

    expect(screen.queryByTestId("BoardColumn")).not.toBeInTheDocument();
  });
});
