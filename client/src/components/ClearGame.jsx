import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useGuessy } from "../contexts/useGuessy";
import GuessyButton from "./GuessyButton";
import GuessyConfirmationDialog from "./GuessyConfirmationDialog";

function ClearGame({ setLoadingCards }) {
  const [open, setOpen] = useState(false);
  const { replaceGame } = useGuessy();

  function handleClearGame() {
    setLoadingCards(true);
    replaceGame();
  }

  return (
    <>
      <GuessyButton onClick={() => setOpen(true)}>New Game</GuessyButton>
      <GuessyConfirmationDialog
        id="ringtone-menu"
        keepMounted
        open={open}
        onConfirm={handleClearGame}
        setOpen={setOpen}
      />
    </>
  );
}

export default ClearGame;
