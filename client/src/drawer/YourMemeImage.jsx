import { useState, lazy } from "react";
import PropTypes from "prop-types";

import Popover from "@mui/material/Popover";

const MissingStub = lazy(() => import("../card/MissingStub"));
import { memeData } from "../assets/memeCollection";
import { usePlayers } from "../hooks/useContextHooks";
import { colorD } from "../assets/styles";
import { GuessySuspense } from "../components/GuessySuspense";

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
    return (
      <GuessySuspense>
        <MissingStub />;
      </GuessySuspense>
    );
  }
};

YourMemeImage.propTypes = {
  dialogWidth: PropTypes.string,
};

export default YourMemeImage;
