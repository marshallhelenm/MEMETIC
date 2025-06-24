import { useState } from "react";
import CardModal from "./CardModal";

function Overlay({ item, overlay, flipped }) {
  const [modalOpen, setModalOpen] = useState(false);
  if (modalOpen || (!flipped && overlay)) {
    return (
      <div className="overlay">
        <div
          className="overlay-item stub-origin"
          onClick={(e) => e.stopPropagation()}
        >
          <a href={item.origin} target="_blank" rel="noopener noreferrer">
            <i className="fa-solid fa-question fa-lg overlay-icon"></i>
          </a>
        </div>
        <div className="overlay-item">
          <CardModal
            item={item}
            setModalOpen={setModalOpen}
            icon={"magnifying-glass-plus"}
          >
            <img
              src={`/memes/${item.img}`}
              alt={item.alt}
              className="modal-image"
            />
          </CardModal>
        </div>
        <div className="overlay-item">
          <CardModal
            item={item}
            setModalOpen={setModalOpen}
            icon={"square-check"}
          >
            <h1>GUESS THIS?</h1>
          </CardModal>
        </div>
      </div>
    );
  }
}

export default Overlay;
