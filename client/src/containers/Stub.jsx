import { useState, useEffect } from "react";
import StubImage from "../components/StubImage";
import Overlay from "../components/Overlay";

function Stub({ itemKey, item, roomKey, isPlayerCard }) {
  const [flipped, setFlipped] = useState(false);
  const [overlay, setOverlay] = useState(false);
  const storageId = `${roomKey}-${item.stub}`;
  const height = 200 * item.height_multiplier + 2;

  function setStubStatus(status) {
    localStorage.setItem(storageId, status);
    status === "flipped" ? setFlipped(true) : setFlipped(false);
  }

  function flip(e) {
    e.preventDefault();
    const newStatus = flipped ? "visible" : "flipped";
    setStubStatus(newStatus);
    setFlipped(!flipped);
  }

  useEffect(() => {
    if (localStorage.getItem(storageId) === "flipped") {
      setFlipped(true);
    } else {
      setFlipped(false);
    }
  }, [setFlipped, storageId]);

  function playerStar() {
    if (!isPlayerCard) return;
    return <i className="fa-solid fa-star fa-xl player-card-star absolute"></i>;
  }

  return (
    <div
      className={`stub ${isPlayerCard ? "player-card" : ""}`}
      id={itemKey}
      style={{ height: `${height}px` }}
      onClick={flip}
      onMouseEnter={() => setOverlay(true)}
      onMouseLeave={() => setOverlay(false)}
    >
      {playerStar()}
      {<Overlay item={item} overlay={overlay} flipped={flipped} />}
      <StubImage
        item={item}
        flip={flip}
        flipped={flipped}
        itemKey={itemKey}
        height={height}
      />
    </div>
  );
}

export default Stub;
