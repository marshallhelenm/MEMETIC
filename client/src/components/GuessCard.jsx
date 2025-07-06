import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

import GuessyButton from "./GuessyButton";
import { devLog } from "../utils/Helpers";
import { usePlayers } from "../hooks/useContextHooks";

function ConfirmDialog({ onConfirm, open, setOpen, setModalOpen }) {
  const handleCancel = (e) => {
    e.stopPropagation();
    setOpen(false);
    setModalOpen(false);
  };

  const handleOk = (e) => {
    e.stopPropagation();
    console.log("GUESSED");
    onConfirm();
    setOpen(false);
    setModalOpen(false);
  };

  return (
    <Dialog
      sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
      maxWidth="xs"
      open={open}
      onClose={handleCancel}
    >
      <DialogTitle>Clear current game?</DialogTitle>
      <DialogContent dividers>
        Do you think this is player2s card?
      </DialogContent>
      <DialogActions>
        <GuessyButton autoFocus onClick={handleCancel} dark>
          No
        </GuessyButton>
        <GuessyButton onClick={handleOk} dark>
          Yes!
        </GuessyButton>
      </DialogActions>
    </Dialog>
  );
}

function GuessCard({ setModalOpen, itemKey }) {
  const [open, setOpen] = useState(false);
  const { player1Uuid, player2Uuid } = usePlayers();
  const myUuid = sessionStorage.getItem("guessy-uuid");
  const isPlayer1 = myUuid == player1Uuid;
  const isPlayer2 = myUuid == player2Uuid;

  function handleOpen(e) {
    e.stopPropagation();
    setModalOpen(true);
    setOpen(true);
  }

  function handleGuess() {
    let correct = false;
    if (isPlayer1) {
      devLog(["guess player2 card: ", itemKey, correct]);
    } else if (isPlayer2) {
      devLog(["guess player1 card: ", itemKey, correct]);
    }
    // TODO: confetti if correct? Well, some kind of feedback anyways.
  }

  return (
    <>
      <div onClick={handleOpen}>
        <i className={`fa-solid fa-square-check fa-lg overlay-icon`}></i>
      </div>
      <ConfirmDialog
        keepMounted
        open={open}
        onConfirm={handleGuess}
        setOpen={setOpen}
        setModalOpen={setModalOpen}
      />
    </>
  );
}

export default GuessCard;
