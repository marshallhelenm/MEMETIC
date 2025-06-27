import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

import { useGuessy } from "../contexts/useGuessy";
import GuessyButton from "./GuessyButton";
import { devLog } from "../utils/Helpers";

function ConfirmDialog({ onConfirm, open, setOpen, setModalOpen }) {
  const handleCancel = (e) => {
    e.stopPropagation();
    setOpen(false);
    setModalOpen(false);
  };

  const handleOk = (e) => {
    e.stopPropagation();
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

function GuessCard({ item, setModalOpen, itemKey }) {
  const [open, setOpen] = useState(false);

  function handleOpen(e) {
    e.stopPropagation();
    setModalOpen(true);
    setOpen(true);
  }

  function handleGuess() {
    devLog(["guess card: ", itemKey]);
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
