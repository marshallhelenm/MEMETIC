import React, { useEffect, useState } from "react";

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
import { useRef } from "react";

const ChatBox = () => {
  const [searchParams] = useSearchParams();
  const myUsername = searchParams.get("username");
  const roomKey = searchParams.get("roomKey");
  const [open, setOpen] = useState(sessionStorage.getItem("guessy-chat-open"));
  const { sendJsonMessage, lastChatHistoryMessage, lastMessageReceivedAt } =
    useWS();
  const [newMessage, setNewMessage] = useState("");
  const { messageHistory, setMessageHistory } = useGame();
  // const { setMessageHistory } = useGame();
  const { lastChatHistoryMessageChanged } = useTraceUpdate({
    lastChatHistoryMessage,
  });
  const inputRef = useRef(null);

  function handleSetOpen() {
    setOpen(!open);
    sessionStorage.setItem("guessy-chat-open", true);
  }

  function sendMessage() {
    console.log("sendMessage: ", newMessage);

    if (newMessage.length > 0) {
      console.log("sendMessage: ", newMessage);
      let message = {
        props: {
          model: {
            sender: myUsername,
            message: newMessage,
          },
        },
      };
      sendJsonMessage({
        type: "chatMessage",
        roomKey,
        messageContents: message,
      });
      setMessageHistory((prev) => [...prev, message]);
      setNewMessage("");
    }
  }

  useEffect(() => {
    if (lastChatHistoryMessageChanged && lastChatHistoryMessage.chatHistory) {
      setMessageHistory(lastChatHistoryMessage.chatHistory);
    }
  }, [lastChatHistoryMessage, lastChatHistoryMessageChanged]);

  function messageList() {
    return (
      <MessageList
        style={{ height: "500px" }}
        // typingIndicator={<TypingIndicator content="Eliot is typing" />}
        className="memetic"
      >
        {messageHistory.map((m, i) => {
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
      sx={{
        position: "fixed",
        bottom: 10,
        right: 10,
        width: "300px",
      }}
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
                  <i
                    className={`fa-solid fa-chevron-down fa-xs chat-collapse`}
                  ></i>
                )}
                {!open && (
                  <i
                    className={`fa-solid fa-chevron-up fa-xs chat-collapse`}
                  ></i>
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
              value={newMessage}
              onChange={(m) => {
                setNewMessage(m);
              }}
              onSend={sendMessage}
              className="memetic"
            />
          )}
        </ChatContainer>
      </Card>
    </Box>
  );
};

export default ChatBox;
