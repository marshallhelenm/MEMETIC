import { useState } from "react";
import { Link } from "react-router-dom";
import TextField from "@mui/material/TextField";

import Logo from "./Logo";
import GuessyButton from "./GuessyButton";
import { colorA, colorD, corners } from "../assets/styles";
import { useGuessy } from "../contexts/useGuessy";

function Join() {
  const [enteredRoomKey, setEnteredRoomKey] = useState("");
  const { guessyManager, dispatch } = useGuessy();
  function handleJoin() {
    dispatch({ type: "updateRoomKey", payload: { roomKey: enteredRoomKey } });
    guessyManager("joinRoom", { roomKey: enteredRoomKey });
  }

  return (
    <div>
      <Logo />
      <h1 className="heading">Join Game</h1>
      <div style={{ marginTop: "5%", marginBottom: "5%" }}>
        <TextField
          placeholder="Room Key"
          onChange={(e) => {
            setEnteredRoomKey(e.target.value);
          }}
          maxLength={8}
          minLength={8}
          variant="outlined"
          sx={{
            backgroundColor: colorD,
            fontColor: colorA,
            borderRadius: corners,
            justifySelf: "center",
            marginRight: "2%",
          }}
        />
      </div>
      <Link to={`/name_thyself?roomKey=${enteredRoomKey}`} onClick={handleJoin}>
        <GuessyButton>Join Game</GuessyButton>
      </Link>
    </div>
  );
}

export default Join;
