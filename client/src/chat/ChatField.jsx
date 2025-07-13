import React, { useState } from "react";

import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";

import { useWS } from "../hooks/useContextHooks";

const ChatField = ({ setMessageHistory, myUsername, roomKey }) => {
  const [newMessage, setNewMessage] = useState("");
  const { sendJsonMessage } = useWS();

  function sendMessage() {
    if (newMessage.length > 0) {
      console.log("sendMessage: ", newMessage);
      let message = {
        username: myUsername,
        timeStamp: Date.now(),
        text: newMessage,
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

  function handleKeyUp(e) {
    if (e.key === "Enter") sendMessage();
  }

  return (
    <OutlinedInput
      id="chat-field"
      onChange={(e) => {
        setNewMessage(e.target.value);
      }}
      endAdornment={
        <InputAdornment position="end">
          <IconButton aria-label="send message" onClick={sendMessage}>
            <i className={`fa-solid fa-paper-plane fa-m`}></i>
          </IconButton>
        </InputAdornment>
      }
      onKeyUp={handleKeyUp}
      sx={{ width: "100%" }}
      type="text"
      value={newMessage}
    />
  );
};

export default ChatField;
