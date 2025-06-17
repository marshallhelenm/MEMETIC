import queryString from "query-string";
import io from "socket.io-client";
import "./Chat.css";
import InfoBar from "../InfoBar/InfoBar";
import Input from "../Input/Input";
import Messages from "../Messages/Messages";
import TextContainer from "../TextContainer/TextContainer";
import { useEffect, useState } from "react";

const ENDPOINT = "http://localhost:5000/";

let socket;


const Chat = () => {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [usersInRoom, setUsersInRoom] = useState([]);

  useEffect(() => {
    // const { name, room } = queryString.parse(location.search);
    const name = "el"
    const room = "el"
    console.log(name, room);

    socket = io(ENDPOINT);

    setName(name);
    setRoom(room);

    console.log(socket);

    return () => {
      socket.emit("disconnect");
      socket.off();
    };
  }, [location.search]);

  useEffect(() => {
    socket.on("message", (message) => {
      setMessages([...messages, message]);
    });
  }, [messages]);

  useEffect(() => {
    socket.on("roomData", (data) => {
      console.log("data.users", data.users);
      setUsersInRoom([...usersInRoom, ...data.users]);
    });
  }, [usersInRoom]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message) {
      socket.emit("sendMessage", message, () => setMessage(""));
    }
  };
  console.log("message: ", message);
  console.log("messages: ", messages);

  return (
    <div className="outerContainer">
      <div className="container">
        <InfoBar room={room} />
        <Messages messages={messages} name={name} />
        <Input
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
        />
        <TextContainer className="textContainer" users={usersInRoom} />
      </div>
    </div>
  );
};

export default Chat;
