import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import ListItemText from "@mui/material/ListItemText";

import StyledDialog from "./StyledDialog";
import { DrawerButton, DrawerIcon, DrawerItem } from "./DrawerComponents";

const QuestionsModal = ({ opacity, drawerOpen }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const qs = [
    "Hypothetically, would I go on a date with this meme?",
    "Would I relate to this meme?",
    "Would I be attracted to this meme?",
    "Would I want this person to fight alongside me during the apocalypse?",
    "Would this meme be my sidekick?",
    "Would I get in trouble for using this meme in the office slack channel?",
    "Does conversation with me regularly inspire use of this meme?",
  ];

  return (
    <>
      <DrawerItem onClick={handleOpen}>
        <DrawerButton drawerOpen={drawerOpen}>
          <DrawerIcon icon="question" drawerOpen={drawerOpen} />
          <ListItemText primary="How To Play" sx={[opacity]} />
        </DrawerButton>
      </DrawerItem>
      <StyledDialog
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>Questions to Ask</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={(theme) => ({
            position: "absolute",
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <i className="fa-solid fa-xmark"></i>
        </IconButton>
        <DialogContent
          id="modal-modal-description"
          dividers
          sx={{ mt: 2, padding: "10%" }}
        >
          <div style={{ padding: "5%" }}>
            {qs.map((item, index) => (
              <p
                key={"q" + index}
                style={{ textAlign: "center", fontSize: "1.1em" }}
              >
                {item}
              </p>
            ))}
          </div>
        </DialogContent>
      </StyledDialog>
    </>
  );
};

export default QuestionsModal;
