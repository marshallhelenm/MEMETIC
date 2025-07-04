import PropTypes from "prop-types";
import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import DialogContent from "@mui/material/DialogContent";
import Tooltip from "@mui/material/Tooltip";
import ListItemText from "@mui/material/ListItemText";

import StyledDialog from "../components/StyledDialog";
import {
  DrawerButton,
  DrawerIcon,
  DrawerItem,
} from "../drawer/DrawerComponents";
import { colorA, colorB } from "../assets/styles";
import { memeData } from "../assets/memeCollection";
import { useGame, usePlayers } from "../hooks/useContextHooks";
import YourMemeImage from "../drawer/YourMemeImage";

const PlayerCardModal = ({ drawerOpen, opacity }) => {
  const { myPlayerCard, assignNewMyPlayerCard } = usePlayers();
  const [open, setOpen] = useState(false);
  const { dialogWidth } = useGame();
  let item = memeData[myPlayerCard];

  if (!item) return;

  const handleOpen = (e) => {
    setOpen(true);
  };
  const handleClose = (e) => {
    setOpen(false);
  };

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
      <StyledDialog open={open} onClose={handleClose} maxWidth={dialogWidth}>
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
        {item.title && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <h2 style={{ margin: "5px" }}>{item.title}</h2>
          </div>
        )}
        <DialogContent dividers>
          <div
            className="row"
            style={{ justifyContent: "space-around", alignItems: "center" }}
          >
            <div className="row" style={{ alignItems: "center" }}>
              <i
                className={`fa-solid fa-star fa-xl`}
                style={{ color: colorB, marginRight: "5%" }}
              ></i>
              <h4 style={{ textWrap: "nowrap", margin: "5%" }}>Your Meme</h4>
              <Tooltip title="Pick A Different Meme" placement="right-end">
                <div>
                  <IconButton
                    onClick={assignNewMyPlayerCard}
                    size="small"
                    sx={{
                      // backgroundColor: colorB,
                      color: colorB,
                    }}
                    variant="contained"
                  >
                    <i className={`fa-solid fa-rotate fa-lg`}></i>
                  </IconButton>
                </div>
              </Tooltip>
            </div>
          </div>
          <YourMemeImage item={item} dialogWidth={dialogWidth} />
        </DialogContent>
      </StyledDialog>
    </>
  );
};

PlayerCardModal.propTypes = {
  drawerOpen: PropTypes.bool,
  opacity: PropTypes.shape({
    opacity: PropTypes.number,
  }),
};

export default PlayerCardModal;
