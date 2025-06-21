import "../App.css";
import { memeSampler } from "../assets/memeCollection";
import { useGuessy } from "../contexts/useGuessy";
import GuessyButton from "./GuessyButton";
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useState } from "react";


function ConfirmationDialogRaw({onConfirm, open, setOpen}) {
  const handleCancel = () => setOpen(false);
  
  const handleOk = () => {
    onConfirm()
    setOpen(false)
  };

  return (
    <Dialog
      sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
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
        <GuessyButton onClick={handleOk} dark>Ok</GuessyButton>
      </DialogActions>
    </Dialog>
  );
}

function ClearGame({setMemeCollection, roomKey}) {
  const [open, setOpen] = useState(false);
  const {setRoomContents, cleanUpLocalStorage} = useGuessy()
  
  function handleClearGame(){
    let new_memes = memeSampler()
    setMemeCollection(new_memes)
    setRoomContents(roomKey, new_memes)
    cleanUpLocalStorage(roomKey)
    localStorage.setItem(`guessy-${roomKey}`, JSON.stringify(new_memes) )
  }

  return (
    <>
      <GuessyButton onClick={()=>setOpen(true)}>New Game</GuessyButton>
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
