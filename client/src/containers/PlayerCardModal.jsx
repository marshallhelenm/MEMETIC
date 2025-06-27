import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import StyledDialog from "../components/StyledDialog";
import GuessyButton from "../components/GuessyButton";
import MissingStub from "../components/MissingStub";
import { colorA, colorB } from "../assets/styles";
import { memeData } from "../assets/memeCollection";
import { useGuessy } from "../contexts/useGuessy";
import { handleLocalStorage } from "../utils/LocalStorageHandler";
import { useWS } from "../contexts/useWS";
import { devLog } from "../utils/Helpers";

const PlayerCardModal = ({ playerCard, roomKey }) => {
  const [modalCard, setModalCard] = useState(
    playerCard || handleLocalStorage({ type: "getPlayerCard", roomKey })
  );
  let item = memeData[modalCard];
  const [open, setOpen] = useState(false);
  const { randomCardKey, roomObject } = useGuessy();
  const { sendJsonMessage } = useWS();

  const handleOpen = (e) => {
    setOpen(true);
  };
  const handleClose = (e) => {
    setOpen(false);
  };

  const assignNewPlayerCard = () => {
    const keys = roomObject["memeSet"]["allKeys"];
    const newCard = randomCardKey(keys);
    devLog(["assignNewPlayerCard: ", newCard]);

    sendJsonMessage({
      type: "setPlayerCard",
      roomKey: roomKey,
      card: newCard,
    });
    handleLocalStorage({ type: "setPlayerCard", card: newCard, roomKey });
    setModalCard(newCard);
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
