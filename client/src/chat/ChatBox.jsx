import React, { useEffect, useState } from "react";

import Card from "@mui/material/Card";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";

import { useGame, useWS } from "../hooks/useContextHooks";
import ChatField from "./ChatField";
import Messages from "./Messages";
import { useSearchParams } from "react-router-dom";
import { useTraceUpdate } from "../hooks/useTraceUpdate";

const ChatBox = () => {
  const [searchParams] = useSearchParams();
  const myUsername = searchParams.get("username");
  const roomKey = searchParams.get("roomKey");
  const [open, setOpen] = useState(sessionStorage.getItem("guessy-chat-open"));
  const { lastChatHistoryMessage } = useWS();
  const { messageHistory, setMessageHistory } = useGame();
  const { lastChatHistoryMessageChanged } = useTraceUpdate({
    lastChatHistoryMessage,
  });

  function handleSetOpen() {
    setOpen(!open);
    sessionStorage.setItem("guessy-chat-open", true);
  }

  useEffect(() => {
    if (lastChatHistoryMessageChanged && lastChatHistoryMessage.chatHistory) {
      setMessageHistory(lastChatHistoryMessage.chatHistory);
    }
  }, [lastChatHistoryMessage, lastChatHistoryMessageChanged]);

  function bar() {
    return (
      <AppBar position="static" onClick={handleSetOpen}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            {open && <i className={`fa-solid fa-chevron-down fa-xs`}></i>}
            {!open && <i className={`fa-solid fa-chevron-up fa-xs`}></i>}
          </IconButton>
          <i
            className={`fa-regular fa-message fa-sm`}
            onClick={() => setOpen(false)}
          ></i>
        </Toolbar>
      </AppBar>
    );
  }

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 2,
        right: 2,
        width: "300px",
      }}
    >
      {!open && bar()}
      {open && (
        <Card>
          {bar()}
          <Messages messageHistory={messageHistory} myUsername={myUsername} />
          <ChatField
            setMessageHistory={setMessageHistory}
            myUsername={myUsername}
            roomKey={roomKey}
          />
        </Card>
      )}
    </Box>
  );
};

export default ChatBox;
