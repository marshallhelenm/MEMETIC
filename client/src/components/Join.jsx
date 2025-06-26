import GuessyButton from "./GuessyButton"
import Input from "@mui/material/Input"
import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";

function Join() {
  const [enteredRoomKey, setEnteredRoomKey] = useState("");

  return (
    <div>
      <Logo />
      <h1 className="heading">Join Game</h1>
      <div>
        <Input
          placeholder="Room Name"
          type="text"
          onChange={(e) => {
            setEnteredRoomKey(e.target.value);
          }}
          maxLength={8}
          minLength={8}
        />
      </div>
      <Link to={`/play?roomKey=${enteredRoomKey}`}>
        <GuessyButton>Join Game</GuessyButton>
      </Link>
    </div>
  );
}

export default Join;
