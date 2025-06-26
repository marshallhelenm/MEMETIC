import "../App.css";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import NewGame from "../components/NewGame";
import { useState } from "react";
import GuessyButton from "../components/GuessyButton";
import { useGuessy } from "../contexts/useGuessy";

//The first page you see. Holds options to join a game or start a new game.
function LandingPage() {
  return (
    <div>
      <Logo spin={true} />
      <h1 className="heading">Guessy</h1>
      <NewGame />
      <Link to="/join">
        <GuessyButton>Join game</GuessyButton>
      </Link>
    </div>
  );
}

export default LandingPage;
