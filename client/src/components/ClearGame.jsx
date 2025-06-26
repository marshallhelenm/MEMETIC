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
import { handleLocalStorage } from "../utils/LocalStorageHandler";
import { devLog } from "../utils/Helpers";

function ConfirmationDialogRaw({ onConfirm, open, setOpen }) {
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

function ClearGame({ roomKey, setLoadingCards }) {
  const [open, setOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const username = searchParams.get("username");
  const { sendJsonMessage } = useGuessy();

  function handleClearGame() {
    let new_memes = memeSampler();
    setLoadingCards(true);
    // TODO: make this into a 'replaceRoomContents' message type
    // This will replace the current memes in the room with a new set
    // make corresponding changes in the server code
    devLog("Clearing game, new memes: ", new_memes);
    sendJsonMessage({
      type: "setRoomContents",
      roomKey: roomKey,
      memeSet: new_memes,
      username,
    });
    // TODO: updateRoomObject should be called here
    handleLocalStorage({
      type: "cleanUp",
      roomKey: roomKey,
      searchParams,
    });
  }

  return (
    <>
      <GuessyButton onClick={() => setOpen(true)}>New Game</GuessyButton>
      <ConfirmationDialogRaw
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
