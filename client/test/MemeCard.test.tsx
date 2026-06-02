import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

import MemeCard from "../src/card/MemeCard";
import * as useContextHooks from "../src/hooks/useContextHooks";

// ----- Mock sessionStorage -----
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
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

jest.mock("../src/card/MemeCardFront", () => {
  return {
    __esModule: true,
    default: jest.fn((props) => (
      <div data-testid="MemeCardFront" onClick={props.flip} />
    )),
  };
});

jest.mock("../src/card/MemeCardBack", () => {
  return {
    __esModule: true,
    default: jest.fn((props) => (
      <div data-testid="MemeCardBack" onClick={props.flip} />
    )),
  };
});

describe("MemeCard", () => {
  const roomKey = "room123";
  const itemKey = "item456";
  const item = { height_multiplier: 1.5 };

  const storageId = `${roomKey}-flipped-${itemKey}`;

  beforeEach(() => {
    sessionStorage.clear();

    jest.spyOn(useContextHooks, "useGame").mockReturnValue({
      columnWidth: 220,
    } as any);

    // Mock usePlayers to return a player card id
    jest.spyOn(useContextHooks, "usePlayers").mockReturnValue({
      myPlayerCard: itemKey,
    });

    jest.requireMock("../src/card/MemeCardFront").default.mockClear();
    jest.requireMock("../src/card/MemeCardBack").default.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders MemeCardFront and MemeCardBack with correct props", () => {
    render(<MemeCard roomKey={roomKey} itemKey={itemKey} item={item} />);

    const expectedCardWidth = 220;
    const expectedHeight = expectedCardWidth * item.height_multiplier + 2;

    const MemeCardFrontMock = jest.requireMock("../src/card/MemeCardFront").default;
    expect(MemeCardFrontMock).toHaveBeenCalledWith(
      expect.objectContaining({
        itemKey,
        item,
        isPlayerCard: true,
        height: expectedHeight,
        cardWidth: expectedCardWidth,
        flip: expect.any(Function),
      }),
      undefined
    );

    const MemeCardBackMock = jest.requireMock("../src/card/MemeCardBack").default;
    expect(MemeCardBackMock).toHaveBeenCalledWith(
      expect.objectContaining({
        itemKey,
        item,
        isPlayerCard: true,
        height: expectedHeight,
        cardWidth: expectedCardWidth,
        flip: expect.any(Function),
      }),
      undefined
    );
  });
});
