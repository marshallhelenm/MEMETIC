import React from "react";
import PropTypes from "prop-types";

import MemeCardImage from "./MemeCardImage";
import { colorD, colorG } from "../assets/styles";

function MemeCardBack({
  itemKey,
  item,
  isPlayerCard,
  flip,
  height,
  cardWidth,
}) {
  return (
    <div
      className="stub"
      id={itemKey}
      style={{
        height: `${height}px`,
        width: `${cardWidth}px`,
        backgroundImage: "images/bgq1.png",
        backgroundColor: isPlayerCard ? colorG : colorD,
      }}
      onClick={flip}
    >
      <MemeCardImage
        item={item}
        flip={flip}
        flipped={true}
        height={height}
        isPlayerCard={isPlayerCard}
      />
    </div>
  );
}

MemeCardBack.propTypes = {
  flip: PropTypes.func,
  height: PropTypes.number,
  isPlayerCard: PropTypes.bool,
  item: PropTypes.shape({
    alt: PropTypes.string,
    img: PropTypes.string,
    title: PropTypes.string,
  }),
  itemKey: PropTypes.string,
  cardWidth: PropTypes.number,
};

export default MemeCardBack;
