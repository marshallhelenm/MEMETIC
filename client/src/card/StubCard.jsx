import React from "react";
import PropTypes from "prop-types";
import { useState } from "react";
import ReactCardFlip from "react-card-flip";

import StubBack from "./StubBack";
import StubFront from "./StubFront";
import { usePlayers } from "../hooks/useContextHooks";

function StubCard({ roomKey, itemKey, item }) {
  const { myPlayerCard } = usePlayers();
  const isPlayerCard = itemKey === myPlayerCard;
  const storageId = `${roomKey}-flipped-${itemKey}`;
  const [flipped, setFlipped] = useState(
    sessionStorage.getItem(storageId) === "true"
  );
  const height = 200 * item.height_multiplier + 2;

  function flip(e) {
    e.preventDefault();
    window.sessionStorage.setItem(storageId, !flipped);
    setFlipped(!flipped);
  }

  return (
    <div
      style={{
        height: height,
        position: "relative",
        display: "inline-block",
        marginBottom: "10px",
      }}
    >
      <ReactCardFlip
        isFlipped={flipped}
        flipDirection="horizontal"
        onClick={flip}
      >
        <StubFront
          itemKey={itemKey}
          item={item}
          isPlayerCard={isPlayerCard}
          flip={flip}
          height={height}
        />
        <StubBack
          itemKey={itemKey}
          item={item}
          isPlayerCard={isPlayerCard}
          flip={flip}
          height={height}
        />
      </ReactCardFlip>
    </div>
  );
}

StubCard.propTypes = {
  item: PropTypes.shape({
    height_multiplier: PropTypes.number,
  }),
  itemKey: PropTypes.string,
  roomKey: PropTypes.string,
};

export default StubCard;
