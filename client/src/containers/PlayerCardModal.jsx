import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Tooltip from "@mui/material/Tooltip";

import StyledDialog from "../components/StyledDialog";
import GuessyButton from "../components/GuessyButton";
import MissingStub from "../components/MissingStub";
import { colorA, colorB } from "../assets/styles";
import { memeData } from "../assets/memeCollection";
import { useGuessy } from "../contexts/useGuessy";

const PlayerCardModal = () => {
  const { observer, guessyManager, myPlayerCard } = useGuessy();
  const [open, setOpen] = useState(false);

  let item = memeData[myPlayerCard];
  if (!item) return;

  const handleOpen = (e) => {
    setOpen(true);
  };
  const handleClose = (e) => {
    setOpen(false);
  };

  const assignNewPlayerCard = () => {
    guessyManager("assignNewPlayerCard");
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

  if (observer) {
    return (
      <div>
        <Tooltip title="This room is full! You're just an observer here.">
          <i className={`fa-solid fa-star fa-lg observer-star`}></i>
          Observer
        </Tooltip>
      </div>
    );
  } else {
    return (
      <>
        <div onClick={handleOpen} className="pointer">
          <i className={`fa-solid fa-star fa-lg player-card-star`}></i>
          View Your Meme
        </div>
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
                //   justifyContent: "space-around",
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
                <GuessyButton onClick={assignNewPlayerCard} dark={true}>
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
  }
};

export default PlayerCardModal;
