import MissingStub from "../components/MissingStub";
import { memeData } from "../assets/memeCollection";
import { usePlayers } from "../contexts/useContextHooks";
import { useState } from "react";
import { colorA, colorD } from "../assets/styles";
import Popover from "@mui/material/Popover";

const YourMemeImage = ({ dialogWidth }) => {
  const { myPlayerCard } = usePlayers();
  let item = memeData[myPlayerCard];
  const [anchorEl, setAnchorEl] = useState(null);

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  function hoverDiv() {
    return (
      <Popover
        className="popover"
        sx={{
          pointerEvents: "none",
          // backgroundColor: colorA,
          opacity: 0.9,
          color: colorD,
        }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "center",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        <h4 style={{ margin: "5%" }}>
          This is your meme! Your partner is trying to guess it.
        </h4>
      </Popover>
    );
  }

  if (item) {
    return (
      <>
        {hoverDiv()}
        <img
          src={`/memes/${item.img}`}
          alt={item.alt}
          className="modal-image"
          onMouseEnter={handlePopoverOpen}
          onMouseLeave={handlePopoverClose}
          style={{ maxWidth: dialogWidth, marginBottom: "10%" }}
        />
      </>
    );
  } else {
    return <MissingStub />;
  }
};

export default YourMemeImage;
