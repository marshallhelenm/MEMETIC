import "../App.css";
import Logo from "../components/Logo";
import { memeData } from "../assets/memeCollection";

//the page you see while actually playing the game
function PlayGame() {
  return (
    <div>
      <img
        src='/memes/let_me_in.png'
        alt={memeData['let_me_in']['alt']}
        className="corners"
        style={{height: '35vh'}}
        />
      <div className="row">
          <Logo size={"small"} spin={false} />
          <h3 className="heading">Error connecting to the server. Please try again soon!</h3>
      </div>
    </div>
  );
}

export default PlayGame;
