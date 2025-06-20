import { Button, Icon } from "semantic-ui-react";
import "../App.css";
import QuestionsModal from "../components/QuestionsModal";
import Logo from "../components/Logo";
import GifPauseButton from "../components/GifPauseButton";
import { memeSampler } from "../assets/memeCollection";
import { useGuessy } from "../contexts/GuessyContext";
import ClearGame from "./ClearGame";

function PlayGameHeader({setMemeCollection, roomKey}) {
  const {setRoomContents, joinRoom, staticGifs, setStaticGifs} = useGuessy()
  
  function handleClearGame(){
    let new_memes = memeSampler()
    setMemeCollection(new_memes)
    setRoomContents(roomKey, new_memes)
    localStorage.setItem(`guessy-${roomKey}`, JSON.stringify(new_memes) )
  }

  function toggleStaticGifs(){
    setStaticGifs(!staticGifs)
  }

  function gifIcon(){
    if (staticGifs) {
      return <Icon name='play' />
    } else {
      return <Icon name='pause' />
    }
  }

  return (
    <div className="play-header">
      <h4 className="roomKey">Room Key: <span className="colorF">{roomKey}</span></h4>
      <div className="row">
        <Logo spin={false} header={true} />
        <h1 className="heading">Guessy</h1>
      </div>
      <div>
        <div className="row header-buttons">
          <QuestionsModal />
          {/* TODO: implement confirmation modal for clearing the game */}
          <ClearGame setMemeCollection={setMemeCollection} roomKey={roomKey}/>
        </div>
        <GifPauseButton />
      </div>
    </div>
  );
}

export default PlayGameHeader;
