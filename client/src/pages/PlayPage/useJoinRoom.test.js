import React from "react";
import { renderHook, act } from "@testing-library/react";
import { useJoinRoom } from "./useJoinRoom";

// test useJoinRoom
jest.useFakeTimers();

describe("useJoinRoom", () => {
  it("does nothing if validGame is true", () => {
    const sendMock = jest.fn();
    renderHook(() =>
      useJoinRoom({
        validGame: true,
        roomKey: "ABCDEFGH",
        username: "test",
        gameKey: "gamekey",
        sendJsonMessage: sendMock,
      })
    );
    jest.advanceTimersByTime(500);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("calls sendJsonMessage after delay when joining", () => {
    const sendMock = jest.fn();
    renderHook(() =>
      useJoinRoom({
        validGame: false,
        roomKey: "ABCDEFGH",
        username: "test",
        gameKey: "gamekey",
        sendJsonMessage: sendMock,
        retryDelay: 200,
      })
    );

    expect(sendMock).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "joinRoom",
        roomKey: "ABCDEFGH",
        username: "test",
      })
    );
  });

  it("does not call sendJsonMessage if no roomKey or username", () => {
    const sendMock = jest.fn();

    renderHook(() =>
      useJoinRoom({
        validGame: false,
        roomKey: null,
        username: "test",
        gameKey: "gamekey",
        sendJsonMessage: sendMock,
      })
    );

    jest.advanceTimersByTime(500);
    expect(sendMock).not.toHaveBeenCalled();
  });
});
