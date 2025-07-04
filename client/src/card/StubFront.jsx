import PropTypes from "prop-types";
import { useState } from "react";

import StubImage from "../card/StubImage";
import Overlay from "./Overlay";
import { colorE, colorG } from "../assets/styles";

function StubFront({ itemKey, item, isPlayerCard, flip, height }) {
  const [overlay, setOverlay] = useState(false);

  function playerStar() {
    if (!isPlayerCard) return;
    return (
      <i
        className="fa-solid fa-star fa-xl player-card-star absolute"
        style={{ transform: "translateX(-50%)" }}
      ></i>
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
          backgroundColor: isPlayerCard ? colorG : colorE,
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
