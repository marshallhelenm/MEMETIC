import React, { Component } from "react";
import "../App.css";
import { Button } from "semantic-ui-react";
import question from "../assets/question.png"
import { Link } from "react-router-dom";

//The first page you see. Holds options to join a game or start a new game.
function LandingPage() {
  return (
      <header className="primary-style">
        <img
          src={question}
          alt="a spinning question mark"
          className="Guessy-logo"
        />
        <h1>Guessy</h1>
        <Link to="/new_game">
          <Button>
            New Game
          </Button>
        </Link>
        <Link to="/join">
          <Button>
            Join game
          </Button>
        </Link>
      </header>
  );
}

export default LandingPage;
