import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

import { useGuessy } from "../contexts/useGuessy";
import GuessyButton from "./GuessyButton";

function ConfirmDialog({ onConfirm, open, setOpen }) {
  const handleCancel = () => setOpen(false);

  const handleOk = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <Dialog
      sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
      maxWidth="xs"
      open={open}
    >
      <DialogTitle>Clear current game?</DialogTitle>
      <DialogContent dividers>
        The memes will be replaced with a new set for every player in the room!
      </DialogContent>
      <DialogActions>
        <GuessyButton autoFocus onClick={handleCancel} dark>
          Cancel
        </GuessyButton>
        <GuessyButton onClick={handleOk} dark>
          Ok
        </GuessyButton>
      </DialogActions>
    </Dialog>
  );
}

function ClearGame({ setLoadingCards }) {
  const [open, setOpen] = useState(false);
  const { guessyActor } = useGuessy();

  function handleClearGame() {
    setLoadingCards(true);
    guessyActor("replaceGame");
  }

  return (
    <>
      <GuessyButton onClick={() => setOpen(true)}>New Game</GuessyButton>
      <ConfirmDialog
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
