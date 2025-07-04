import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import StyledDialog from "../components/StyledDialog";
import { DrawerButton, DrawerIcon, DrawerItem } from "./DrawerComponents";

const QuestionsModal = ({ opacity, drawerOpen }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const qs = [
    "Would I get in trouble for using this meme in the office slack channel?",
    "Hypothetically, would I go on a date with this meme?",
    "Does conversation with me regularly inspire use of this meme?",
    "Would I relate to this meme?",
    "Would I be attracted to this meme?",
    "Would I want this person to fight alongside me during the apocalypse?",
    "Would this meme be my sidekick?",
    "Is this meme going through it?",
  ];

  return (
    <>
      <DrawerItem onClick={handleOpen}>
        <DrawerButton drawerOpen={drawerOpen}>
          <Tooltip title="How To Play" placement="right-end">
            <div>
              <DrawerIcon icon="circle-question" drawerOpen={drawerOpen} />
            </div>
          </Tooltip>
          <ListItemText primary="How To Play" sx={[opacity]} />
        </DrawerButton>
      </DrawerItem>
      <StyledDialog
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <DialogTitle sx={{ m: 0, p: 2, textAlign: "center" }}>
          How To Play
        </DialogTitle>
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
            <Typography variant="body1" gutterBottom>
              Did you ever play{" "}
              <a
                href="https://en.wikipedia.org/wiki/Guess_Who%3F"
                target="_blank"
                rel="noopener noreferrer"
              >
                Guess Who?
              </a>{" "}
              It’s just like that!
            </Typography>
            <Typography variant="body1" gutterBottom>
              Share the link with your room key with someone to start a game -
              you should both be seeing the same set of images. This is a two
              player game, but others can still view the same room if they have
              the link.
            </Typography>
            <Typography variant="body1" gutterBottom>
              You are each randomly assigned one meme, which the other player is
              trying to guess. (If you don’t like your meme or feel unsure you
              know enough about it, you can get a new one by clicking on the
              star in the sideBar.)
            </Typography>
            <Typography variant="body1" gutterBottom>
              Take turns asking Yes or No questions to eliminate possibilities.
              You can flip down cards as you eliminate them by clicking on them.
            </Typography>
            <Typography variant="body1" gutterBottom>
              The better crafted your questions, the more cards you can
              eliminate at once. The more weird your questions, the more fun
              you’ll have.
            </Typography>
            <Typography variant="body1" gutterBottom>
              Once you’re done, hit New Game in the sidebar to get a fresh set
              of memes!
            </Typography>
            <Divider />
            <Typography
              variant="subtitle2"
              gutterBottom
              sx={{ marginTop: "5%" }}
            >
              Some example questions:
            </Typography>
            {qs.map((item, index) => (
              <Typography variant="body2" key={"q" + index}>
                {item}
              </Typography>
            ))}
            <Divider sx={{ marginTop: "5%" }} />

            <Typography variant="body2">
              Directly inspired by{" "}
              <a
                href="https://ve.media.tumblr.com/tumblr_q8otm9qrlU1w0qmsw.mp4"
                target="_blank"
                rel="noopener noreferrer"
              >
                this tiktok
              </a>
              .
            </Typography>
          </div>
        </DialogContent>
      </StyledDialog>
    </>
  );
};

export default QuestionsModal;
