import React, { useEffect, useState, useRef } from "react";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import {
  ChatContainer,
  ConversationHeader,
  MessageList,
  Message,
  MessageInput,
} from "@chatscope/chat-ui-kit-react";
import { useWS } from "../../hooks/useContextHooks";
import { useSearchParams } from "react-router-dom";
import type { ChatEntry } from "../../messages";

const ChatBox: React.FC = () => {
  const [searchParams] = useSearchParams();
  const myUsername = searchParams.get("username");
  const roomKey = searchParams.get("roomKey");
  const [open, setOpen] = useState(
    sessionStorage.getItem("guessy-chat-open") === "true"
  );
  const { sendJsonMessage, lastChatHistoryMessage, lastGameContentsMessage } = useWS();
  const [newChatCMessage, setNewChatCMessage] = useState("");
  const [messageHistory, setMessageHistory] = useState<ChatEntry[]>(
    lastGameContentsMessage?.chatHistory ?? []
  );
  const inputRef = useRef<HTMLInputElement | null>(null);

  function handleSetOpen() {
    setOpen(!open);
    sessionStorage.setItem("guessy-chat-open", String(!open));
  }

  function sendChatMessage() {
    if (!roomKey || !myUsername || newChatCMessage.length === 0) return;
    const entry: ChatEntry = {
      sender: myUsername,
      chatText: newChatCMessage,
      timestamp: Date.now(),
    };
    sendJsonMessage({ type: "chatMessage", roomKey, messageContents: entry });
    // The server broadcasts history to everyone except the sender, so show it locally.
    setMessageHistory((prev) => [...prev, entry]);
    setNewChatCMessage("");
  }

  // Both messages carry the room's full chat history; take whichever arrived last.
  useEffect(() => {
    if (lastGameContentsMessage?.chatHistory) {
      setMessageHistory(lastGameContentsMessage.chatHistory);
    }
  }, [lastGameContentsMessage]);

  useEffect(() => {
    if (lastChatHistoryMessage?.chatHistory) {
      setMessageHistory(lastChatHistoryMessage.chatHistory);
    }
  }, [lastChatHistoryMessage]);

  function messageList() {
    return (
      <MessageList style={{ height: "500px" }} className="memetic">
        {messageHistory.map((entry, i) => {
          // Only the first of several consecutive messages from one sender gets a name header.
          const sequential = i > 0 && messageHistory[i - 1].sender === entry.sender;
          return (
            <Message
              key={`${entry.timestamp}-${i}`}
              className="memetic"
              model={{
                // The chat kit renders "html" (its default) as raw HTML; chat is plain text.
                type: "text",
                message: entry.chatText,
                sender: entry.sender,
                direction: entry.sender === myUsername ? "outgoing" : "incoming",
                position: "single",
              }}
            >
              {!sequential && <Message.Header sender={entry.sender} />}
            </Message>
          );
        })}
      </MessageList>
    );
  }

  return (
    <Box
      sx={{ position: "fixed", bottom: 10, right: 10, width: "300px" }}
      onClick={() => inputRef.current?.focus()}
    >
      <Card>
        <ChatContainer className={`memetic ${open ? "open" : "closed"}`}>
          <ConversationHeader onClick={handleSetOpen} className="memetic">
            <ConversationHeader.Back>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={handleSetOpen}
              >
                {open && (
                  <i className={`fa-solid fa-chevron-down fa-xs chat-collapse`} />
                )}
                {!open && (
                  <i className={`fa-solid fa-chevron-up fa-xs chat-collapse`} />
                )}
              </IconButton>
            </ConversationHeader.Back>
            <ConversationHeader.Content></ConversationHeader.Content>
            <ConversationHeader.Actions>
              <i
                className={`fa-regular fa-message fa-sm`}
                onClick={() => setOpen(false)}
              ></i>
            </ConversationHeader.Actions>
          </ConversationHeader>
          {open && messageList()}
          {open && (
            <MessageInput
              ref={inputRef}
              autoFocus
              placeholder="Type message here"
              attachButton={false}
              value={newChatCMessage}
              onChange={setNewChatCMessage}
              onSend={sendChatMessage}
              className="memetic"
            />
          )}
        </ChatContainer>
      </Card>
    </Box>
  );
};

export default ChatBox;
