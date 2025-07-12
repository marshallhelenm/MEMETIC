import React from "react";
import { expect, describe, it } from "@jest/globals";

import { getPlayPageRender } from "./getPlayPageRender";

describe("getPlayPageRender", () => {
  it("returns InvalidRoomKey if roomKey is missing", () => {
    expect(getPlayPageRender({ roomKey: null })).toBe("InvalidRoomKey");
  });

  it("returns InvalidRoomKey if roomKey length is not 8", () => {
    expect(getPlayPageRender({ roomKey: "BAD" })).toBe("InvalidRoomKey");
  });

  it("returns PlayGame if validGame and connectionOpen", () => {
    expect(
      getPlayPageRender({
        roomKey: "ABCDEFGH",
        validGame: true,
        connectionOpen: true,
      })
    ).toBe("PlayGame");
  });

  it("returns ErrorPageConnection if connectionError and not tryingToConnect", () => {
    expect(
      getPlayPageRender({
        roomKey: "ABCDEFGH",
        connectionError: true,
        tryingToConnect: false,
      })
    ).toBe("ErrorPageConnection");
  });

  it("returns ErrorPageServer if serverError is not empty", () => {
    expect(
      getPlayPageRender({
        roomKey: "ABCDEFGH",
        serverError: "Oops!",
      })
    ).toBe("ErrorPageServer");
  });

  it("returns RoomLoading by default", () => {
    expect(
      getPlayPageRender({
        roomKey: "ABCDEFGH",
        serverError: "",
      })
    ).toBe("RoomLoading");
  });
});
