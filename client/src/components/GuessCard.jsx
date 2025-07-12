import React from "react";
import { useState } from "react";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

import GuessyButton from "./GuessyButton";
import { devLog } from "../utils/Helpers";
import { usePlayers } from "../hooks/useContextHooks";
import Confetti from "./Confetti";

function GuessCard({ setModalOpen, itemKey, testId }) {
  const [open, setOpen] = useState(false);
  const { player1Uuid, player2Uuid, player1Card, player2Card, players } =
    usePlayers();
  const [guessedRight, setGuessedRight] = useState(false);
  const [guessedWrong, setGuessedWrong] = useState(false);
  const myUuid = sessionStorage.getItem("guessy-uuid");
  const isPlayer1 = myUuid == player1Uuid;
  const isPlayer2 = myUuid == player2Uuid;

  const handleCancel = (e) => {
    e.stopPropagation();
    setOpen(false);
    setModalOpen(false);
  };

  const handleOk = (e) => {
    e.stopPropagation();
    let correct = false;
    if (isPlayer1) {
      correct = itemKey == player2Card;
      devLog(["guess player2 card: ", itemKey, correct]);
    } else if (isPlayer2) {
      correct = itemKey == player1Card;
      devLog(["guess player1 card: ", itemKey, correct]);
    }
    correct ? setGuessedRight(true) : setGuessedWrong(true);
  };

  function handleOpen(e) {
    e.stopPropagation();
    setModalOpen(true);
    setOpen(true);
  }

  function dialogContents() {
    if (guessedRight) {
      return (
        <>
          <DialogTitle>You did it!</DialogTitle>
          <DialogContent dividers>
            <div className="row">
              <span>Have some Confetti!</span> <Confetti />
            </div>
          </DialogContent>
        </>
      );
    } else if (guessedWrong) {
      return (
        <>
          <DialogTitle>Nope!</DialogTitle>
          <DialogContent dividers>{"Looks like that wasn't it!"}</DialogContent>
        </>
      );
    } else {
      return (
        <>
          <DialogTitle>Make A Guess?</DialogTitle>
          <DialogContent dividers>
            Do you think this is{" "}
            {isPlayer1
              ? players[player2Uuid].username
              : players[player1Uuid].username}
            {"'"}s card?
          </DialogContent>
          <DialogActions>
            <GuessyButton
              autoFocus
              onClick={handleCancel}
              dark
              id="cancelGuessButton"
            >
              No
            </GuessyButton>
            <GuessyButton onClick={handleOk} dark id="confirmGuessButton">
              Yes!
            </GuessyButton>
          </DialogActions>
        </>
      );
    }
  }

  function dialog() {
    if (open) {
      return (
        <Dialog
          sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
          maxWidth="xs"
          open={open}
          onClose={handleCancel}
        >
          {dialogContents()}
        </Dialog>
      );
    }
  }

  return (
    <>
      <div onClick={handleOpen} data-testid={testId}>
        <i className={`fa-solid fa-square-check fa-lg overlay-icon`}></i>
      </div>
      {dialog()}
    </>
  );
}

export default GuessCard;
