import React from "react";
import { Button } from "semantic-ui-react";
import { memeSampler } from "../assets/memeCollection";

// TODO: Implement confirmation modal here 

function ClearGame({ roomKey, setMemeCollection }) {
  // a way to start a new game at the same roomkey
  function clearMemes() {
    let new_memes = memeSampler()
    localStorage.setItem(`guessy-${roomKey}`, JSON.stringify(new_memes) )
    setMemeCollection(new_memes)
    // plus socket stuff
  }

  return <Button onClick={clearMemes}>New Game</Button>;
}

export default ClearGame;
