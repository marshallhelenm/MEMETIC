import React from "react";
import { colorC, colorD } from "../assets/styles";

const MyMessage = ({ message }) => {
  return (
    <div style={{ alignSelf: "right", backgroundColor: colorC }}>
      {message.username}: {message.text}
    </div>
  );
};
const IncomingMessage = ({ message }) => {
  return (
    <div style={{ alignSelf: "left", backgroundColor: colorD }}>
      {message.username}: {message.text}
    </div>
  );
};

const Message = ({ myUsername, message }) => {
  const itMe = message.username == myUsername;
  return itMe ? (
    <MyMessage message={message} />
  ) : (
    <IncomingMessage message={message} />
  );
};

const Messages = ({ messageHistory, myUsername }) => {
  return (
    <div style={{ minHeight: "100px", maxHeight: "500px", overflow: "scroll" }}>
      {messageHistory.map((message) => {
        return (
          <Message
            myUsername={myUsername}
            message={message}
            key={message.timeStamp}
          />
        );
      })}
    </div>
  );
};

export default Messages;
