import React from "react";
import { Button } from "semantic-ui-react";
import { memeSampler } from "../assets/memeCollection";

// TODO: Implement confirmation modal here 

function ClearGame({ roomKey }) {
  // a way to start a new game at the same roomkey
  function clearMemes() {
    localStorage.setItem(`guessy-${roomKey}`, JSON.stringify(memeSampler()) )
    // plus socket stuff
  }

  return <Button onClick={clearMemes}>New Game</Button>;
}

export default ClearGame;
