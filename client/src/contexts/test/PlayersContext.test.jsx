import React from "react";
import { render, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { PlayersProvider, PlayersContext } from "../PlayersContext";
import * as useContextHooks from "../../hooks/useContextHooks";

describe("PlayersContext", () => {
  let ws;
  let ctx;

  const contents = (overrides = {}) => ({
    type: "gameContents",
    allKeys: [],
    columnsObject: {},
    gameKey: 1000,
    chatHistory: [],
    player1Uuid: "me",
    player2Uuid: "bob",
    players: {
      me: { uuid: "me", username: "Me", card: "cat" },
      bob: { uuid: "bob", username: "Bob", card: "dog" },
      eve: { uuid: "eve", username: "Eve", card: "owl" },
    },
    ...overrides,
  });

  const tree = () => (
    <MemoryRouter initialEntries={["/play?roomKey=ABCDEFGH"]}>
      <PlayersProvider>
        <PlayersContext.Consumer>{(value) => ((ctx = value), null)}</PlayersContext.Consumer>
      </PlayersProvider>
    </MemoryRouter>
  );

  beforeEach(() => {
    sessionStorage.clear();
    sessionStorage.setItem("guessy-uuid", "me");
    ws = { sendJsonMessage: jest.fn(), lastGameContentsMessage: contents() };
    jest.spyOn(useContextHooks, "useWS").mockImplementation(() => ws);
    jest.spyOn(useContextHooks, "useGame").mockImplementation(() => ({ gameKey: 1000 }));
  });

  afterEach(() => jest.restoreAllMocks());

  it("reads players, roles and cards from the game contents", () => {
    render(tree());

    expect(Object.keys(ctx.players)).toEqual(["me", "bob", "eve"]);
    expect(ctx.player1Uuid).toBe("me");
    expect(ctx.player2Uuid).toBe("bob");
    expect(ctx.myPlayerCard).toBe("cat");
    expect(ctx.player1Card).toBe("cat");
    expect(ctx.player2Card).toBe("dog");
    expect(ctx.isObserver).toBe(false);
  });

  it("follows a role change even when the player list is unchanged", () => {
    const { rerender } = render(tree());

    ws = { ...ws, lastGameContentsMessage: contents({ player1Uuid: "eve" }) };
    rerender(tree());

    expect(ctx.player1Uuid).toBe("eve");
    expect(ctx.isObserver).toBe(true);
  });

  it("asks the server to demote player 2 without changing roles locally", () => {
    render(tree());

    act(() => ctx.demotePlayer2("bob"));

    expect(ws.sendJsonMessage).toHaveBeenCalledWith({ type: "demotePlayer2", roomKey: "ABCDEFGH" });
    expect(ctx.player2Uuid).toBe("bob");
  });

  it("ignores a demote request for someone who is not player 2", () => {
    render(tree());

    act(() => ctx.demotePlayer2("eve"));

    expect(ws.sendJsonMessage).not.toHaveBeenCalled();
  });

  it("remembers this player's card for the current game", () => {
    render(tree());

    expect(JSON.parse(sessionStorage.getItem("guessy-ABCDEFGH-player-card"))).toEqual({
      gameKey: 1000,
      card: "cat",
    });
  });

  it("has no players before any game contents arrive", () => {
    ws = { ...ws, lastGameContentsMessage: null };
    render(tree());

    expect(ctx.players).toEqual({});
    expect(ctx.myPlayerCard).toBeNull();
  });
});
