import IconButton from "@mui/material/IconButton";
import StyledDialog from "./StyledDialog";
import DialogContent from "@mui/material/DialogContent";
import { useState } from "react";
import { colorA } from "../assets/styles";

const CardModal = ({ item, children, icon, setModalOpen }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = (e) => {
    e.stopPropagation();
    setOpen(true);
    setModalOpen(true);
  };
  const handleClose = (e) => {
    e.stopPropagation()
    setModalOpen(false);
    setOpen(false);
  };

  if (!item) return;

  return (
    <>
      <div onClick={handleOpen}>
        <i className={`fa-solid fa-${icon} fa-lg overlay-icon`}></i>
      </div>
      <StyledDialog open={open} onClose={handleClose} maxWidth="md" >
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
        <DialogContent
          id="modal-modal-description"
        >
          {children}
        </DialogContent>
      </StyledDialog>
    </>
  );
};

export default CardModal;
