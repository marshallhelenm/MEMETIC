import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import ListItemText from "@mui/material/ListItemText";

import GuessyButton from "./GuessyButton";
import { DrawerButton, DrawerIcon, DrawerItem } from "./DrawerComponents";
import { useGuessy } from "../contexts/useGuessy";
import { Tooltip } from "@mui/material";

function ClearGame({ opacity, drawerOpen }) {
  const [clearGameOpen, setClearGameOpen] = useState(false);
  const { guessyManager, dispatch } = useGuessy();

  const handleCancel = () => setClearGameOpen(false);

  const handleOk = () => {
    handleClearGame();
    setClearGameOpen(false);
  };

  function handleClearGame() {
    guessyManager("replaceGame");
  }

  function handleClickAway() {
    if (clearGameOpen) {
      return () => setClearGameOpen(false);
    }
  }

  return (
    <>
      <DrawerItem onClick={() => setClearGameOpen(true)}>
        <DrawerButton drawerOpen={drawerOpen}>
          <Tooltip title="New Game" placement="right-end">
            <div>
              <DrawerIcon icon="rotate" drawerOpen={drawerOpen} />
            </div>
          </Tooltip>
          <ListItemText primary="New Game" sx={[opacity]} />
        </DrawerButton>
      </DrawerItem>
      <Dialog
        sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
        maxWidth="xs"
        open={clearGameOpen}
      >
        <DialogTitle>Clear current game?</DialogTitle>
        <DialogContent dividers>
          The memes will be replaced with a new set for every player in the
          room!
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
    </>
  );
}

export default ClearGame;
