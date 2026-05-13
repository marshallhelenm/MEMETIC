import { useState, lazy, Suspense, ReactNode } from "react";
import IconButton from "@mui/material/IconButton";
import StyledDialog from "../components/StyledDialog.js";
const DialogContent = lazy(() => import("@mui/material/DialogContent"));
import { colorA } from "../assets/styles.js";
import { useGame } from "../hooks/useContextHooks";
import { GuessySuspense } from "../components/GuessySuspense.js";
import type { MemeData } from "../types/meme.js";

interface CardModalProps {
  item: MemeData;
  children: ReactNode;
  icon: string;
  setModalOpen: (open: boolean) => void;
}

const CardModal: React.FC<CardModalProps> = ({ item, children, icon, setModalOpen }) => {
  const { dialogWidth } = useGame();
  const [open, setOpen] = useState<boolean>(false);
  const handleOpen = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setOpen(true);
    setModalOpen(true);
  };
  const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setModalOpen(false);
    setOpen(false);
  };

  if (!item) return null;

  return (
    <>
      <div onClick={handleOpen}>
        <i className={`fa-solid fa-${icon} fa-lg overlay-icon`}></i>
      </div>
      <StyledDialog open={open} onClose={handleClose} maxWidth={dialogWidth as any}>
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

export default CardModal;
