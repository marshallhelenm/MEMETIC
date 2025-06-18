import "../App.css";
import Board from "./Board";
import QuestionsModal from "../components/QuestionsModal";
import ClearGame from "../components/ClearGame";
import { useEffect, useState } from "react";
import Logo from "../components/Logo";
import { memeSampler } from "../assets/memeCollection";

//the page you see while actually playing the game
function PlayGame() {
  const roomKey = "asgSdg"
  const [memeCollection, setMemeCollection] = useState([])

  useEffect(()=>{
    const memes = JSON.parse(localStorage.getItem(`guessy-${roomKey}`));
    if (memes) {
      setMemeCollection(memes);
    } else {
      let new_memes = memeSampler()
      localStorage.setItem(`guessy-${roomKey}`, JSON.stringify(new_memes))
      setMemeCollection(new_memes)
    }
  }, [])

  return (
    <div className="play-game">
      <div className="play-header">
        <Logo spin={false} />
        <h3>Room Key: {roomKey}</h3>
        <div className="column-md-6">
          <QuestionsModal />
        </div>
        <div className="column-md-6">
          <ClearGame roomKey={roomKey} setMemeCollection={setMemeCollection} />
        </div>
      </div>
      <Board items={memeCollection} />
    </div>
  );
}

export default PlayGame;
