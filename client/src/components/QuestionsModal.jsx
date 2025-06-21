import { IconButton, Dialog, styled, DialogTitle, DialogContent } from '@mui/material';
import GuessyButton from "./GuessyButton";
import { colorE } from "../assets/styles";
import { useState } from "react";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
  '& .MuiPaper-root': {
    backgroundColor: colorE,
  },
}));

const QuestionsModal = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = (e) => {
    setOpen(true);
  }
  const handleClose = () => setOpen(false);
  
  const qs = [
    "Hypothetically, would I go on a date with this meme?",
    "Would I relate to this meme?",
    "Would I be attracted to this meme?",
    "Would I want this person to fight alongside me during the apocalypse?",
    "Would this meme be my sidekick?",
    "Would I get in trouble for using this meme in the office slack channel?",
    "Does conversation with me regularly inspire use of this meme?"
  ];

  return (
    <>
      <GuessyButton onClick={handleOpen}>Question Ideas</GuessyButton>
      <StyledDialog
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Questions to Ask
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
        <i className="fa-solid fa-xmark"></i>
        </IconButton>
        <DialogContent id="modal-modal-description" dividers sx={{ mt: 2, padding: "10%" }}>
          <div style={{padding:"5%"}}>
            {qs.map((item, index) => (
              <p key={"q"+index} style={{textAlign: "center", fontSize: "1.1em"}}>{item}</p>
            ))}
          </div>
        </DialogContent>
      </StyledDialog>
    </>
  );
};

export default QuestionsModal;
