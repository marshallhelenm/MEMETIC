import React, { useState, lazy, MouseEvent } from "react";
import Popover from "@mui/material/Popover";
import { memeData } from "../assets/memeCollection";
import { usePlayers } from "../hooks/useContextHooks";
import { colorD } from "../assets/styles";
import { GuessySuspense } from "../components/GuessySuspense";
import { MemeData } from "../types/meme";

const MissingStub = lazy(() => import("../card/MissingStub"));

interface YourMemeImageProps {
  dialogWidth?: string;
  item: MemeData | undefined;
}

const YourMemeImage: React.FC<YourMemeImageProps> = ({ dialogWidth }) => {
  const { myPlayerCard } = usePlayers();
  const item = myPlayerCard ? memeData[myPlayerCard] : undefined;
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handlePopoverOpen = (event: MouseEvent<HTMLElement>) => {
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
        <MissingStub />
      </GuessySuspense>
    );
  }
};

export default YourMemeImage;
