import React from "react";
import { render, screen, act } from "@testing-library/react";
import * as useWebSocketModule from "react-use-websocket";

import { WSProvider, WSContext } from "./WSContext";

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

  it("handles uuid from sessionStorage", () => {
    sessionStorage.setItem("guessy-uuid", "test-uuid");

    renderWithConsumer();

    expect(sendJsonMessageMock).not.toHaveBeenCalledWith(
      expect.objectContaining({
        type: "requestUuid",
      })
    );
  });

  it("updates serverError via setServerError", () => {
    // Use a test component to set serverError
    render(
      <WSProvider>
        <WSContext.Consumer>
          {(value) => (
            <>
              <div data-testid="serverError">{value.serverError}</div>
              <button onClick={() => value.setServerError("Bad")}>
                Set Error
              </button>
            </>
          )}
        </WSContext.Consumer>
      </WSProvider>
    );

    expect(screen.getByTestId("serverError").textContent).toBe("");

    act(() => {
      screen.getByText("Set Error").click();
    });

    expect(screen.getByTestId("serverError").textContent).toBe("Bad");
  });

  it("responds to lastJsonMessage with serverError type", () => {
    useWebSocketModule.default.mockImplementation(() => ({
      sendJsonMessage: sendJsonMessageMock,
      lastJsonMessage: { type: "serverError", error: JSON.stringify("Oops!") },
      readyState: useWebSocketModule.ReadyState.OPEN,
    }));

    renderWithConsumer();
  });
});
