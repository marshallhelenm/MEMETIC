import "../App.css";
import { Button, Input } from "semantic-ui-react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import NewGame from "../components/NewGame";
import { useState } from "react";
import useWebSocket from "react-use-websocket"
import Login from "../components/Login";
import { useGuessy } from "../contexts/GuessyContext";

//The first page you see. Holds options to join a game or start a new game.
function LandingPage() {
  const {onLogin, username} = useGuessy()
  const [roomKey, setRoomKey] = useState("");
  
  

  function handleNewRoom(roomKey){
    setRoomKey(roomKey)
  }

  if (username){
    return (
      <div>
        <Logo spin={true} />
        <h1>Guessy</h1>
        <h2 className="heading">Hello, {username}!</h2>
        <NewGame handleNewRoom={handleNewRoom} />
        <Link to="/join">
          <Button>
            Join game
          </Button>
        </Link>
      </div>
    );
  } else {
    return (
      <Login onSubmit={onLogin} />
    )
  }
}

export default LandingPage;
