import React from "react";
import * as reactRouterDom from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import * as useContextHooks from "../../hooks/useContextHooks";
import PlayPage from "./PlayPage";

// Mock lazy components
jest.mock("./InvalidRoomKey", () => () => <div data-testid="InvalidRoomKey" />);
jest.mock("../ErrorPage", () => ({ type }) => (
  <div data-testid={`ErrorPage-${type}`} />
));
jest.mock("../../containers/PlayGame", () => () => (
  <div data-testid="PlayGame" />
));
jest.mock("../RoomLoading", () => () => <div data-testid="RoomLoading" />);
jest.mock("../../components/GuessySuspense", () => ({
  LogoSuspense: ({ children }) => <>{children}</>,
}));
jest.mock("../../contexts/PlayersContext", () => ({
  PlayersProvider: ({ children }) => <>{children}</>,
}));

let searchParamsMock;

jest.mock("react-router-dom", () => {
  const originalModule = jest.requireActual("react-router-dom");
  const navigateMock = jest.fn();

  return {
    ...originalModule,
    useNavigate: () => navigateMock,
    __navigateMock: navigateMock,
  };
});

describe("PlayPage Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    searchParamsMock = new URLSearchParams();
  });

  function mockWS(overrides = {}) {
    jest.spyOn(useContextHooks, "useWS").mockReturnValue({
      connectionOpen: false,
      connectionError: false,
      tryingToConnect: false,
      serverError: "",
      sendJsonMessage: jest.fn(),
      ...overrides,
    });
  }

  function mockGame(overrides = {}) {
    jest.spyOn(useContextHooks, "useGame").mockReturnValue({
      validGame: false,
      gameKey: "gamekey",
      ...overrides,
    });
  }

  function renderPlayPage(roomKey = "testRoom", username = "BlackDog") {
    return render(
      <MemoryRouter
        initialEntries={[`/play?roomKey=${roomKey}&username=${username}`]}
      >
        <PlayPage />
      </MemoryRouter>
    );
  }

  it("redirects to /home if no roomKey", async () => {
    searchParamsMock = new URLSearchParams("");
    mockWS();
    mockGame();

    renderPlayPage("", null);
    await waitFor(() => {
      expect(reactRouterDom.__navigateMock).toHaveBeenCalledWith("/home");
    });
  });

  it("redirects to /name_thyself if no username", async () => {
    mockWS();
    mockGame();

    renderPlayPage("ABCDEFGH", "");
    await waitFor(() => {
      expect(reactRouterDom.__navigateMock).toHaveBeenCalledWith(
        "/name_thyself?roomKey=ABCDEFGH"
      );
    });
  });

  it("renders InvalidRoomKey for short roomKey", async () => {
    searchParamsMock = new URLSearchParams("roomKey=BAD");
    mockWS();
    mockGame();

    renderPlayPage("BAD");
    await waitFor(() => {
      expect(screen.getByTestId("InvalidRoomKey")).toBeInTheDocument();
    });
  });

  it("renders PlayGame when validGame and connectionOpen", async () => {
    searchParamsMock = new URLSearchParams("roomKey=ABCDEFGH&username=Bob");
    mockWS({ connectionOpen: true });
    mockGame({ validGame: true });

    renderPlayPage();
    await waitFor(() => {
      expect(screen.getByTestId("PlayGame")).toBeInTheDocument();
    });
  });

  it("renders ErrorPage for connection error", async () => {
    searchParamsMock = new URLSearchParams("roomKey=ABCDEFGH&username=Bob");
    mockWS({ connectionError: true, tryingToConnect: false });
    mockGame();

    renderPlayPage();
    await waitFor(() => {
      expect(screen.getByTestId("ErrorPage-connection")).toBeInTheDocument();
    });
  });

  it("renders ErrorPage for server error", async () => {
    searchParamsMock = new URLSearchParams("roomKey=ABCDEFGH&username=Bob");
    mockWS({ serverError: "Server down" });
    mockGame();

    renderPlayPage();
    await waitFor(() => {
      expect(screen.getByTestId("ErrorPage-server")).toBeInTheDocument();
    });
  });

  it("renders RoomLoading as fallback", async () => {
    searchParamsMock = new URLSearchParams("roomKey=ABCDEFGH&username=Bob");
    mockWS();
    mockGame();

    renderPlayPage();
    await waitFor(() => {
      expect(screen.getByTestId("RoomLoading")).toBeInTheDocument();
    });
  });
});
