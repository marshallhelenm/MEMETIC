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
jest.mock("../src/card/MemeCard", () => ({ itemKey, roomKey }: { itemKey: string; roomKey: string }) => (
  <div data-testid={`MemeCard-${itemKey}`} data-roomkey={roomKey}>
    {itemKey}
  </div>
));
jest.mock("../src/board/BoardColumn", () => ({ cards }: { cards: React.ReactNode }) => (
  <div data-testid="BoardColumn">{cards}</div>
));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useSearchParams: jest.fn(),
}));

describe("CardColumns", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset memeData to empty before each test
    Object.defineProperty(memeCollection, "memeData", {
      value: {},
      writable: true,
      configurable: true,
    });
  });

  function getMockGameContext(columnsObj: any) {
    return {
      createGame: jest.fn(),
      validGame: true,
      setLoadingCards: jest.fn(),
      loadingCards: false,
      columns: columnsObj,
      columnCount: 1,
      staticGifs: false,
      setStaticGifs: jest.fn(),
      allKeys: [],
      gameKey: 1,
      dialogWidth: "100px",
      messageHistory: [],
      setMessageHistory: jest.fn(),
    };
  }

  it("renders correct number of BoardColumn components", () => {
    jest.spyOn(useContextHooks, "useGame").mockReturnValue(
      getMockGameContext({
        1: ["item1", "item2"],
        2: ["item3"],
      })
    );

    (reactRouterDom.useSearchParams as unknown as jest.Mock).mockReturnValue([
      new URLSearchParams("roomKey=testRoom"),
    ]);

    Object.defineProperty(memeCollection, "memeData", {
      value: {
        item1: { title: "Meme1", img: "", origin: "", height_multiplier: 1 },
        item2: { title: "Meme2", img: "", origin: "", height_multiplier: 1 },
        item3: { title: "Meme3", img: "", origin: "", height_multiplier: 1 },
      },
      writable: true,
      configurable: true,
    });

    render(<CardColumns />);

    const columns = screen.getAllByTestId("BoardColumn");
    expect(columns).toHaveLength(2);
    expect(screen.getByTestId("MemeCard-item1")).toHaveAttribute(
      "data-roomkey",
      "testRoom"
    );
    expect(screen.getByTestId("MemeCard-item2")).toHaveAttribute(
      "data-roomkey",
      "testRoom"
    );
    expect(screen.getByTestId("MemeCard-item3")).toHaveAttribute(
      "data-roomkey",
      "testRoom"
    );
  });

  it("renders MissingStub for missing memeData", async () => {
    jest.spyOn(useContextHooks, "useGame").mockReturnValue(
      getMockGameContext({
        1: ["validItem", "missingItem"],
      })
    );

    (reactRouterDom.useSearchParams as unknown as jest.Mock).mockReturnValue([
      new URLSearchParams("roomKey=abc123"),
    ]);

    Object.defineProperty(memeCollection, "memeData", {
      value: {
        validItem: { title: "Valid", img: "", origin: "", height_multiplier: 1 },
      },
      writable: true,
      configurable: true,
    });

    render(<CardColumns />);

    await screen.findAllByTestId("BoardColumn");
    expect(screen.getAllByTestId("BoardColumn")).toHaveLength(1);
    expect(screen.getByTestId("MemeCard-validItem")).toBeInTheDocument();
    expect(screen.getByTestId("MissingStub")).toBeInTheDocument();
  });

  it("renders nothing if columns are empty", () => {
    jest.spyOn(useContextHooks, "useGame").mockReturnValue(
      getMockGameContext({})
    );

    (reactRouterDom.useSearchParams as unknown as jest.Mock).mockReturnValue([
      new URLSearchParams(),
    ]);

    Object.defineProperty(memeCollection, "memeData", {
      value: {},
      writable: true,
      configurable: true,
    });

    render(<CardColumns />);
    expect(screen.queryByTestId("BoardColumn")).not.toBeInTheDocument();
  });
});
