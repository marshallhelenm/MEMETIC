import { useState } from "react";
import CardModal from "../components/CardModal";
import GuessCard from "../components/GuessCard";

function Overlay({ item, overlay, flipped, itemKey }) {
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
          <GuessCard
            item={item}
            setModalOpen={setModalOpen}
            itemKey={itemKey}
          />
        </div>
      </div>
    );
  }
}

export default Overlay;
