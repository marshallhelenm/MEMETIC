import { useState } from "react";

import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";

import GuessyButton from "../components/GuessyButton";
import { usePlayers } from "../hooks/useContextHooks";

function Player2Star({ uuid, canDemote = false }) {
  const [hover, setHover] = useState(false);
  const [demoterOpen, setDemoterOpen] = useState(false);
  const { demotePlayer2 } = usePlayers();

  const handleCancel = () => {
    setHover(false);
    setDemoterOpen(false);
  };

  const handleOk = () => {
    setDemoterOpen(false);
    setHover(false);
    demotePlayer2(uuid);
  };

  function handleMouseEnter() {
    setHover(true);
  }
  function handleMouseLeave() {
    if (!demoterOpen) setHover(false);
  }

  if (!canDemote) {
    return (
      <Tooltip placement="right-end" title="Player 2">
        <i className={`fa-regular fa-star fa-md`} style={{ opacity: 0.8 }}></i>
      </Tooltip>
    );
  }

  if (hover || demoterOpen) {
    return (
      <>
        <Tooltip
          placement="right-end"
          title="Player 2"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <i
            className={`fa-regular fa-circle-xmark fa-md`}
            style={{ opacity: 0.8 }}
            onClick={() => setDemoterOpen(true)}
          ></i>
        </Tooltip>
        <Dialog
          sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
          maxWidth="xs"
          open={demoterOpen}
        >
          <DialogTitle>Demote this player to Observer?</DialogTitle>
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
  } else {
    return (
      <Tooltip
        placement="right-end"
        title="Player 2"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <i className={`fa-regular fa-star fa-md`} style={{ opacity: 0.8 }}></i>
      </Tooltip>
    );
  }
}

export default Player2Star;
