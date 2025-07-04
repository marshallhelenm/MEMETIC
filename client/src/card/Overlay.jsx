import PropTypes from "prop-types";
import { useState } from "react";

import CardModal from "./CardModal";
import MemeOrigin from "./MemeOrigin";

function Overlay({ item, overlay, itemKey }) {
  const [modalOpen, setModalOpen] = useState(false);
  if (modalOpen || overlay) {
    return (
      <div className="overlay">
        <MemeOrigin item={item} />
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
        {/* <div className="overlay-item">
          <GuessCard
            item={item}
            setModalOpen={setModalOpen}
            itemKey={itemKey}
          />
        </div> */}
      </div>
    );
  }
}

Overlay.propTypes = {
  item: PropTypes.shape({
    alt: PropTypes.string,
    img: PropTypes.string,
  }),
  itemKey: PropTypes.string,
  overlay: PropTypes.bool,
};

export default Overlay;
