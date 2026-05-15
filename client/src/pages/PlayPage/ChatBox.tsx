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
import { useGame, useWS } from "../../hooks/useContextHooks";
import { useSearchParams } from "react-router-dom";
import { useTraceUpdate } from "../../hooks/useTraceUpdate";
import type { ChatMessage } from "../../../shared/types/messages";

const ChatBox: React.FC = () => {
  const [searchParams] = useSearchParams();
  const myUsername = searchParams.get("username");
  const roomKey = searchParams.get("roomKey");
  const [open, setOpen] = useState(
    sessionStorage.getItem("guessy-chat-open") === "true"
  );
  const { sendJsonMessage, lastChatHistoryMessage, lastMessageReceivedAt } = useWS();
  const [newChatCMessage, setNewChatCMessage] = useState("");
  const { messageHistory, setMessageHistory } = useGame();
  const { lastChatHistoryMessageChanged } = useTraceUpdate({ lastChatHistoryMessage });
  const inputRef = useRef<HTMLInputElement | null>(null);

  function handleSetOpen() {
    setOpen(!open);
    sessionStorage.setItem("guessy-chat-open", String(!open));
  }

  function sendChatMessage() {
    if (newChatCMessage.length > 0) {
      let message: ChatMessage = {
        type: "chatMessage",
        roomKey,
        messageContents: {
          sender: myUsername,
          chatText: newChatCMessage,
        },
      };
      console.log("Sending chat message:", message);
      sendJsonMessage({
        type: "chatMessage",
        roomKey,
        messageContents: message.messageContents,
      });
      setMessageHistory((prev: any) => [...prev, message]);
      setNewChatCMessage("");
    }
  }

  useEffect(() => {
    if (lastChatHistoryMessageChanged && lastChatHistoryMessage.chatHistory) {
      setMessageHistory(lastChatHistoryMessage.chatHistory);
    }
  }, [lastChatHistoryMessage, lastChatHistoryMessageChanged, setMessageHistory]);

  function messageList() {
    return (
      <MessageList style={{ height: "500px" }} className="memetic">
        {messageHistory.map((m: any, i: number) => {
          let message = { ...m };
          let model = message.props.model;
          model.position = "single";
          model.direction =
            model.sender === myUsername ? "outgoing" : "incoming";
          let sequential =
            i > 0 && messageHistory[i - 1].props.model.sender == model.sender;
          return (
            <Message key={i} {...message.props} className="memetic">
              {!sequential && <Message.Header sender={model.sender} />}
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
