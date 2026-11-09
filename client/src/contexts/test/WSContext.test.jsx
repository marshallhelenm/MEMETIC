import React from "react";
import { render, screen } from "@testing-library/react";
import * as useWebSocketModule from "react-use-websocket";

import { WSProvider, WSContext } from "../WSContext";

// Mock react-use-websocket
jest.mock("react-use-websocket", () => ({
  __esModule: true,
  default: jest.fn(),
  ReadyState: {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
    UNINSTANTIATED: -1,
  },
}));

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

function renderWithConsumer() {
  return render(
    <WSProvider>
      <WSContext.Consumer>
        {(value) => (
          <>
            <div data-testid="connectionOpen">
              {value.connectionOpen.toString()}
            </div>
            <div data-testid="connectionError">
              {value.connectionError ? "true" : "false"}
            </div>
            <div data-testid="serverError">{value.serverError}</div>
          </>
        )}
      </WSContext.Consumer>
    </WSProvider>
  );
}

describe("WSProvider", () => {
  let sendJsonMessageMock;
  let setServerErrorSpy;

  beforeEach(() => {
    // Clear session storage before each test
    sessionStorage.clear();
    jest.clearAllMocks();

    sendJsonMessageMock = jest.fn();

    // Reset the module mock
    useWebSocketModule.default.mockImplementation(() => ({
      sendJsonMessage: sendJsonMessageMock,
      lastJsonMessage: null,
      readyState: useWebSocketModule.ReadyState.CONNECTING,
    }));
  });

  it("provides context with expected defaults", () => {
    renderWithConsumer();

    expect(screen.getByTestId("connectionOpen").textContent).toBe("false");
    expect(screen.getByTestId("connectionError").textContent).toBe("false");
    expect(screen.getByTestId("serverError").textContent).toBe("");
  });

  it("connects with the stored player ID", () => {
    sessionStorage.setItem("guessy-uuid", "test-uuid");

    renderWithConsumer();

    expect(useWebSocketModule.default).toHaveBeenCalledWith(
      expect.stringContaining("?uuid=test-uuid"),
      expect.anything()
    );
  });

  const mockLastMessage = (lastJsonMessage) =>
    useWebSocketModule.default.mockImplementation(() => ({
      sendJsonMessage: sendJsonMessageMock,
      lastJsonMessage,
      readyState: useWebSocketModule.ReadyState.OPEN,
    }));

  it("learns its public player ID from the welcome message", () => {
    mockLastMessage({ type: "welcome", playerId: "public-id-123" });
    let ctx;
    render(
      <WSProvider>
        <WSContext.Consumer>{(value) => ((ctx = value), null)}</WSContext.Consumer>
      </WSProvider>
    );

    expect(ctx.myPlayerId).toBe("public-id-123");
  });

  it("sets serverError from an error message", () => {
    mockLastMessage({ type: "error", error: "Rate limit exceeded" });

    renderWithConsumer();

    expect(screen.getByTestId("serverError").textContent).toBe("Rate limit exceeded");
  });

  it("clears serverError when valid game contents arrive", () => {
    mockLastMessage({ type: "error", error: "Rate limit exceeded" });
    const { rerender } = renderWithConsumer();
    expect(screen.getByTestId("serverError").textContent).toBe("Rate limit exceeded");

    mockLastMessage({ type: "gameContents", allKeys: [], columnsObject: {} });
    rerender(
      <WSProvider>
        <WSContext.Consumer>
          {(value) => <div data-testid="serverError">{value.serverError}</div>}
        </WSContext.Consumer>
      </WSProvider>
    );

    expect(screen.getByTestId("serverError").textContent).toBe("");
  });
});
