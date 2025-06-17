import { Button, Input } from "semantic-ui-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";

function Join() {
  const [roomKey, setRoomKey] = useState("");

  return (
    <div className="joinOuterContainer">
      <div className="joinInnerContainer">
        <Logo />
        <h1 className="heading">Join Game</h1>
        <div>
          <Input
            placeholder="Room Name"
            type="text"
            onChange={(e) => {
              setRoomKey(e.target.value);
            }}
          />
        </div>
        <Link to={`/play?room=${roomKey}`}>
          <Button>
            Join Game
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default Join;
