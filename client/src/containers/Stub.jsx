import { useState, useEffect } from "react";

import StubImage from "../components/StubImage";
import Overlay from "../containers/Overlay";
import { useGuessy } from "../contexts/useGuessy";
import { colorC, colorD, colorE, colorG } from "../assets/styles";

function Stub({ itemKey, item, isPlayerCard }) {
  const [flipped, setFlipped] = useState(false);
  const [overlay, setOverlay] = useState(false);
  const { roomKey } = useGuessy();
  const storageId = `${roomKey}-${item.stub}`;
  const height = 200 * item.height_multiplier + 2;

  function setStubStatus(status) {
    window.sessionStorage.setItem(storageId, status);
    status === "flipped" ? setFlipped(true) : setFlipped(false);
  }

  function flip(e) {
    e.preventDefault();
    const newStatus = flipped ? "visible" : "flipped";
    setStubStatus(newStatus);
    setFlipped(!flipped);
  }

  useEffect(() => {
    if (sessionStorage.getItem(storageId) === "flipped") {
      setFlipped(true);
    } else {
      setFlipped(false);
    }
  }, [setFlipped, storageId]);

  let stubColor = "";
  if (isPlayerCard) {
    stubColor = colorG;
  } else if (flipped) {
    stubColor = colorD;
  } else if (!isPlayerCard && !flipped) {
    stubColor = colorE;
  }

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
    <div
      className={`stub`}
      id={itemKey}
      style={{
        height: `${height}px`,
        backgroundImage: "images/bgq1.png",
        backgroundColor: stubColor,
      }}
      onClick={flip}
      onMouseEnter={() => setOverlay(true)}
      onMouseLeave={() => setOverlay(false)}
    >
      {!flipped && playerStar()}
      {
        <Overlay
          item={item}
          overlay={overlay}
          flipped={flipped}
          itemKey={itemKey}
        />
      }
      <StubImage
        item={item}
        flip={flip}
        flipped={flipped}
        itemKey={itemKey}
        height={height}
        isPlayerCard={isPlayerCard}
      />
    </div>
  );
}

export default Stub;
