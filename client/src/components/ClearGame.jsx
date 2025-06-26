import "../App.css";
import { memeSampler } from "../assets/memeCollection";
import { useGuessy } from "../contexts/useGuessy";
import GuessyButton from "./GuessyButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import GuessyConfirmationDialog from "./GuessyConfirmationDialog";

function ClearGame({ setLoadingCards }) {
  const [open, setOpen] = useState(false);
  const [searchParams] = useSearchParams();
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
