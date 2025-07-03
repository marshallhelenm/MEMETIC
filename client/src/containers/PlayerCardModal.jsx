import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Tooltip from "@mui/material/Tooltip";
import ListItemText from "@mui/material/ListItemText";

import StyledDialog from "../components/StyledDialog";
import GuessyButton from "../components/GuessyButton";
import MissingStub from "../components/MissingStub";
import {
  DrawerButton,
  DrawerIcon,
  DrawerItem,
} from "../components/DrawerComponents";
import { colorA, colorB } from "../assets/styles";
import { memeData } from "../assets/memeCollection";
import { usePlayers } from "../contexts/useContextHooks";

const PlayerCardModal = ({ drawerOpen, opacity }) => {
  const { myPlayerCard, assignNewMyPlayerCard } = usePlayers();
  const [open, setOpen] = useState(false);
  let item = memeData[myPlayerCard];

  if (!item) return;

  const handleOpen = (e) => {
    setOpen(true);
  };
  const handleClose = (e) => {
    setOpen(false);
  };

  function content() {
    if (item) {
      return (
        <img
          src={`/memes/${item.img}`}
          alt={item.alt}
          className="modal-image"
        />
      );
    } else {
      return <MissingStub />;
    }
  }

  return (
    <>
      <DrawerItem onClick={handleOpen}>
        <DrawerButton drawerOpen={drawerOpen}>
          <Tooltip title="Your Meme" placement="right-end">
            <div>
              <DrawerIcon
                onClick={handleOpen}
                drawerOpen={drawerOpen}
                icon="star"
                // classes="player-card-star"
              />
            </div>
          </Tooltip>
          <ListItemText primary={"Your Meme"} sx={[opacity]} />
        </DrawerButton>
      </DrawerItem>
      <StyledDialog open={open} onClose={handleClose} maxWidth="md">
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={() => ({
            position: "absolute",
            right: 10,
            top: 8,
            color: colorA,
          })}
        >
          <i className="fa-solid fa-xmark"></i>
        </IconButton>
        <DialogTitle>
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <div style={{ width: "50%" }}>
              <i
                className={`fa-solid fa-star fa-xl`}
                style={{ color: colorB, marginRight: "5%" }}
              ></i>
              Your Meme
            </div>
            <div style={{ width: "50%" }}>
              <GuessyButton onClick={assignNewMyPlayerCard} dark={true}>
                Pick Another
              </GuessyButton>
            </div>
          </div>
        </DialogTitle>
        {item.title && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <h2>{item.title}</h2>
          </div>
        )}
        <DialogContent dividers id="modal-modal-description">
          <div
            className="row"
            style={{ textAlign: "center", alignItems: "center" }}
          >
            <h4>This is your meme! Your partner is trying to guess it.</h4>
          </div>
        </DialogContent>
        <DialogContent dividers>{content()}</DialogContent>
      </StyledDialog>
    </>
  );
};

export default PlayerCardModal;
