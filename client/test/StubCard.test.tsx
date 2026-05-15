import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

import StubCard from "../src/card/StubCard";
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

jest.mock("../src/card/StubFront", () => {
  return {
    __esModule: true,
    default: jest.fn((props) => (
      <div data-testid="StubFront" onClick={props.flip} />
    )),
  };
});

jest.mock("../src/card/StubBack", () => {
  return {
    __esModule: true,
    default: jest.fn((props) => (
      <div data-testid="StubBack" onClick={props.flip} />
    )),
  };
});

describe("StubCard", () => {
  const roomKey = "room123";
  const itemKey = "item456";
  const item = { height_multiplier: 1.5 };

  const storageId = `${roomKey}-flipped-${itemKey}`;

  beforeEach(() => {
    sessionStorage.clear();

    // Mock usePlayers to return a player card id
    jest.spyOn(useContextHooks, "usePlayers").mockReturnValue({
      myPlayerCard: itemKey,
    });

    jest.requireMock("../src/card/StubFront").default.mockClear();
    jest.requireMock("../src/card/StubBack").default.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders StubFront and StubBack with correct props", () => {
    render(<StubCard roomKey={roomKey} itemKey={itemKey} item={item} />);

    const expectedHeight = 200 * item.height_multiplier + 2;

    const StubFrontMock = jest.requireMock("../src/card/StubFront").default;
    expect(StubFrontMock).toHaveBeenCalledWith(
      expect.objectContaining({
        itemKey,
        item,
        isPlayerCard: true,
        height: expectedHeight,
        flip: expect.any(Function),
      }),
      {}
    );

    const StubBackMock = jest.requireMock("../src/card/StubBack").default;
    expect(StubBackMock).toHaveBeenCalledWith(
      expect.objectContaining({
        itemKey,
        item,
        isPlayerCard: true,
        height: expectedHeight,
        flip: expect.any(Function),
      }),
      {}
    );
  });
});
