import { Button, Input } from "semantic-ui-react";
import "./Join.css";
// import io from "socket.io-client";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// const ENDPOINT = "http://localhost:5000/";

// let socket;

function Join() {
  const [room, setRoom] = useState("");

  const navigate = useNavigate();

  function joinGame() {
    console.log("join game: ",  room);
    
    // socket = io(ENDPOINT);
    // socket.emit("join", { name, room }, (error) => {
    //   if (error) {
    //     console.log("error! ", error);
    //     history.push("join");
    //     alert(error);
    //   } else {
    //     history.push(`/play?name=${name}&room=${room}`);
    //   }
    // });
  }

  return (
    <div className="joinOuterContainer">
      <div className="joinInnerContainer">
        <h1 className="heading">Join Game</h1>
        <div>
          <Input
            placeholder="Room Name"
            type="text"
            onChange={(e) => {
              setRoom(e.target.value);
            }}
          />
        </div>
        <Button onClick={(e)=>{
            e.preventDefault()
            navigate(`/play?room=${room}`)
          }}>
          Join Game
        </Button>
      </div>
    </div>
  );
}

export default Join;
