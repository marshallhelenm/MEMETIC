import "../App.css";
import Join from "../components/Join/Join";
import { Button } from "semantic-ui-react";

function NewGame () {
  function generateRoomKey() {
    let room = Math.random().toString(36).substring(7);
    localStorage.setItem("roomkey", room);
    return room;
  }
  
  return (
    <div className="primary-style">
      <h1>Choose a Category</h1>
        <div>
          <Button>Memes</Button>
          <div>
            <h1>Other Options Coming Soon!</h1>
            <Button >Historical Figures</Button>
            <Button >Cartoon Characters</Button>
          </div>
        </div>
      <Join />
    </div>
  );
}

export default NewGame;


