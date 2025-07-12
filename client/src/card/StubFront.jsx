import React from "react";
import PropTypes from "prop-types";
import { useState } from "react";

import StubImage from "../card/StubImage";
import Overlay from "./Overlay";
import { colorE, colorG } from "../assets/styles";
import goldStar from "../assets/goldStar.png";
import { Tooltip } from "@mui/material";
import { usePlayers } from "../hooks/useContextHooks";

function StubFront({ itemKey, item, isPlayerCard, flip, height }) {
  const [overlay, setOverlay] = useState(false);
  const { isObserver } = usePlayers();
  function playerStar() {
    if (!isPlayerCard || isObserver) return;
    return (
      <Tooltip title="This is your meme!" placement="right-end">
        <img src={goldStar} className="player-card-star absolute"></img>
      </Tooltip>
    );
  }

  return (
    <>
      {playerStar()}
      <div
        className={`stub`}
        id={itemKey}
        style={{
          height: `${height}px`,
          backgroundImage: "images/bgq1.png",
          backgroundColor: isPlayerCard && !isObserver ? colorG : colorE,
        }}
        onClick={flip}
        onMouseEnter={() => setOverlay(true)}
        onMouseLeave={() => setOverlay(false)}
      >
        {<Overlay item={item} overlay={overlay} itemKey={itemKey} />}
        <StubImage
          item={item}
          flip={flip}
          flipped={false}
          height={height}
          isPlayerCard={isPlayerCard}
        />
      </div>
    </>
  );
}

StubFront.propTypes = {
  flip: PropTypes.func,
  height: PropTypes.number,
  isPlayerCard: PropTypes.bool,
  item: PropTypes.shape({
    alt: PropTypes.string,
    img: PropTypes.string,
    title: PropTypes.string,
  }),
  itemKey: PropTypes.string,
};

export default StubFront;
