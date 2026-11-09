import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import * as useContextHooks from "../src/hooks/useContextHooks";

// Lightweight stand-ins for the chat UI kit so the test exercises ChatBox's own logic.
jest.mock("@chatscope/chat-ui-kit-react", () => {
  const passthrough = ({ children }: any) => <div>{children}</div>;
  const ConversationHeader: any = passthrough;
  ConversationHeader.Back = passthrough;
  ConversationHeader.Content = passthrough;
  ConversationHeader.Actions = passthrough;
  const Message: any = ({ model, children }: any) => (
    <div data-testid="chat-message" data-direction={model.direction} data-type={model.type}>
      {children}
      <span>{model.message}</span>
    </div>
  );
  Message.Header = ({ sender }: any) => <strong data-testid="chat-sender">{sender}</strong>;
  return {
    ChatContainer: passthrough,
    ConversationHeader,
    MessageList: passthrough,
    Message,
    MessageInput: ({ value, onChange, onSend }: any) => (
      <>
        <input data-testid="chat-input" value={value} onChange={(e) => onChange(e.target.value)} />
        <button onClick={onSend}>Send</button>
      </>
    ),
  };
});

import ChatBox from "../src/pages/PlayPage/ChatBox";

function renderChatBox({ chatHistory = [] as any[] } = {}) {
  const sendJsonMessage = jest.fn();
  jest.spyOn(useContextHooks, "useWS").mockReturnValue({
    sendJsonMessage,
    lastChatHistoryMessage: null,
    lastGameContentsMessage: { type: "gameContents", chatHistory },
  } as any);

  render(
    <MemoryRouter initialEntries={["/play?roomKey=ABCDEFGH&username=Alice"]}>
      <ChatBox />
    </MemoryRouter>
  );
  return { sendJsonMessage };
}

describe("ChatBox", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    sessionStorage.setItem("guessy-chat-open", "true");
  });

  it("sends a chat message with sender, text and timestamp", () => {
    const { sendJsonMessage } = renderChatBox();

    fireEvent.change(screen.getByTestId("chat-input"), { target: { value: "hi there" } });
    fireEvent.click(screen.getByText("Send"));

    expect(sendJsonMessage).toHaveBeenCalledWith({
      type: "chatMessage",
      roomKey: "ABCDEFGH",
      messageContents: { sender: "Alice", chatText: "hi there", timestamp: expect.any(Number) },
    });
    // The sender sees their own message straight away.
    expect(screen.getByText("hi there")).toBeInTheDocument();
  });

  it("does not send an empty message", () => {
    const { sendJsonMessage } = renderChatBox();

    fireEvent.click(screen.getByText("Send"));

    expect(sendJsonMessage).not.toHaveBeenCalled();
  });

  it("renders history with one sender header per run of messages", () => {
    renderChatBox({
      chatHistory: [
        { sender: "Bob", chatText: "first", timestamp: 1 },
        { sender: "Bob", chatText: "second", timestamp: 2 },
        { sender: "Alice", chatText: "reply", timestamp: 3 },
      ],
    });

    expect(screen.getAllByTestId("chat-message")).toHaveLength(3);
    expect(screen.getAllByTestId("chat-sender").map((el) => el.textContent)).toEqual([
      "Bob",
      "Alice",
    ]);
    const directions = screen
      .getAllByTestId("chat-message")
      .map((el) => el.getAttribute("data-direction"));
    expect(directions).toEqual(["incoming", "incoming", "outgoing"]);
  });

  it("renders messages as plain text, not HTML", () => {
    renderChatBox({ chatHistory: [{ sender: "Bob", chatText: "<img src=x onerror=alert(1)>", timestamp: 1 }] });

    expect(screen.getByTestId("chat-message").getAttribute("data-type")).toBe("text");
  });
});
