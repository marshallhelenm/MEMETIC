import IconButton from "@mui/material/IconButton";
import StyledDialog from "./StyledDialog";
import DialogContent from "@mui/material/DialogContent";
import { useState } from "react";
import { colorA } from "../assets/styles";
import { memeData } from "../assets/memeCollection";
import { DialogTitle } from "@mui/material";

const PlayerCardModal = ({ playerCard }) => {
  let item = memeData[playerCard];
  console.log(item);

  const [open, setOpen] = useState(false);
  const handleOpen = (e) => {
    setOpen(true);
  };
  const handleClose = (e) => {
    setOpen(false);
  };

  return (
    <>
      <div onClick={handleOpen}>
        <i className={`fa-solid fa-star fa-lg player-card-star`}></i>
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
        <DialogTitle >
            <i className={`fa-solid fa-star fa-lg player-card-star`}></i>
            Your Meme
        </DialogTitle>
        <DialogContent dividers id="modal-modal-description" >
            <h4>This is your meme! Your partner is trying to guess it.</h4>
        </DialogContent>
        <DialogContent dividers >
          <img
            src={`/memes/${item.img}`}
            alt={item.alt}
            className="modal-image"
          />
        </DialogContent>
      </StyledDialog>
    </>
  );
};

export default PlayerCardModal;
