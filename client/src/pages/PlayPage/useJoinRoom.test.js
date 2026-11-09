import { renderHook, act } from "@testing-library/react";
import { useJoinRoom } from "./useJoinRoom";

jest.useFakeTimers();

const ofType = (mock, type) => mock.mock.calls.filter(([m]) => m.type === type).map(([m]) => m);

describe("useJoinRoom", () => {
  it("joins as soon as it enters a room, even with a game already loaded", () => {
    const sendMock = jest.fn();
    renderHook(() =>
      useJoinRoom({ validGame: true, roomKey: "ABCDEFGH", username: "test", sendJsonMessage: sendMock })
    );

    expect(ofType(sendMock, "joinRoom")).toEqual([
      expect.objectContaining({ roomKey: "ABCDEFGH", username: "test" }),
    ]);

    // No retries once the game is loaded.
    act(() => jest.advanceTimersByTime(2000));
    expect(ofType(sendMock, "joinRoom")).toHaveLength(1);
  });

  it("keeps retrying the join until the game loads", () => {
    const sendMock = jest.fn();
    renderHook(() =>
      useJoinRoom({
        validGame: false,
        roomKey: "ABCDEFGH",
        username: "test",
        sendJsonMessage: sendMock,
        retryDelay: 200,
      })
    );
    expect(ofType(sendMock, "joinRoom")).toHaveLength(1);

    act(() => jest.advanceTimersByTime(200));

    expect(ofType(sendMock, "joinRoom")).toHaveLength(2);
  });

  it("does not join without a roomKey or username", () => {
    const sendMock = jest.fn();
    renderHook(() =>
      useJoinRoom({ validGame: false, roomKey: null, username: "test", sendJsonMessage: sendMock })
    );

    act(() => jest.advanceTimersByTime(500));

    expect(sendMock).not.toHaveBeenCalled();
  });

  it("leaves the room when the page unmounts", () => {
    const sendMock = jest.fn();
    const { unmount } = renderHook(() =>
      useJoinRoom({ validGame: true, roomKey: "ABCDEFGH", username: "test", sendJsonMessage: sendMock })
    );

    unmount();

    expect(ofType(sendMock, "leaveRoom")).toEqual([{ type: "leaveRoom", roomKey: "ABCDEFGH" }]);
  });

  it("leaves the old room and joins the new one when the room changes", () => {
    const sendMock = jest.fn();
    const { rerender } = renderHook(
      ({ roomKey }) => useJoinRoom({ validGame: true, roomKey, username: "test", sendJsonMessage: sendMock }),
      { initialProps: { roomKey: "ROOMAAAA" } }
    );

    rerender({ roomKey: "ROOMBBBB" });

    expect(ofType(sendMock, "leaveRoom")).toEqual([{ type: "leaveRoom", roomKey: "ROOMAAAA" }]);
    expect(ofType(sendMock, "joinRoom").map((m) => m.roomKey)).toEqual(["ROOMAAAA", "ROOMBBBB"]);
  });
});
