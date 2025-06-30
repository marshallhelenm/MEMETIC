import { useState } from "react";

import StubImage from "../components/StubImage";
import Overlay from "../containers/Overlay";
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

export default StubFront;
