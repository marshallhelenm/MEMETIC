import PropTypes from "prop-types";
import { useState, lazy, Suspense } from "react";

import IconButton from "@mui/material/IconButton";
import StyledDialog from "../components/StyledDialog";
const DialogContent = lazy(() => import("@mui/material/DialogContent"));

import { colorA } from "../assets/styles";
import { useGame } from "../hooks/useContextHooks";
import { GuessySuspense } from "../components/GuessySuspense";

const CardModal = ({ item, children, icon, setModalOpen }) => {
  const { dialogWidth } = useGame();
  const [open, setOpen] = useState(false);
  const handleOpen = (e) => {
    e.stopPropagation();
    setOpen(true);
    setModalOpen(true);
  };
  const handleClose = (e) => {
    e.stopPropagation();
    setModalOpen(false);
    setOpen(false);
  };

  if (!item) return;

  return (
    <>
      <div onClick={handleOpen}>
        <i className={`fa-solid fa-${icon} fa-lg overlay-icon`}></i>
      </div>
      <StyledDialog open={open} onClose={handleClose} maxWidth={dialogWidth}>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={() => ({
            position: "absolute",
            right: 10,
            top: 8,
            color: colorA,
            cursor: "pointer",
          })}
        >
          <i className="fa-solid fa-xmark"></i>
        </IconButton>
        {item.title && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <h2>{item.title}</h2>
          </div>
        )}
        {open && (
          <GuessySuspense>
            <DialogContent id="modal-modal-description">
              {children}
            </DialogContent>
          </GuessySuspense>
        )}
      </StyledDialog>
    </>
  );
};

CardModal.propTypes = {
  children: PropTypes.any,
  icon: PropTypes.string,
  item: PropTypes.shape({
    title: PropTypes.string,
  }),
  setModalOpen: PropTypes.func,
};

export default CardModal;
