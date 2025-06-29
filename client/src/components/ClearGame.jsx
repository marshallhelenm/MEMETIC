import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import ListItemText from "@mui/material/ListItemText";

import GuessyButton from "./GuessyButton";
import { DrawerButton, DrawerIcon } from "./DrawerComponents";
import { useGuessy } from "../contexts/useGuessy";

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

function ClearGame({ setLoadingCards, opacity, drawerOpen }) {
  const [open, setOpen] = useState(false);
  const { guessyManager } = useGuessy();

  function handleClearGame() {
    setLoadingCards(true);
    guessyManager("replaceGame");
  }

  return (
    <DrawerButton drawerOpen={drawerOpen}>
      <DrawerIcon onClick={() => setOpen(true)} icon="rotate" />
      <ListItemText primary="New Game" sx={[opacity]} />
      <ConfirmDialog
        id="ringtone-menu"
        keepMounted
        open={open}
        onConfirm={handleClearGame}
        setOpen={setOpen}
      />
    </DrawerButton>
  );
}

export default ClearGame;
