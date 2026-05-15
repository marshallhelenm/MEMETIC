import { useState } from "react";
import CardModal from "./CardModal";
import MemeOrigin from "./MemeOrigin";
import GuessCard from "../components/GuessCard";
import { usePlayers } from "../hooks/useContextHooks";
import type { MemeData } from "../types/meme";

interface OverlayProps {
  item: MemeData;
  overlay: boolean;
  itemKey: string;
}

const Overlay: React.FC<OverlayProps> = ({ item, overlay, itemKey }) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const { isObserver } = usePlayers();

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
        {!isObserver && (
          <div className="overlay-item">
            <GuessCard
              itemKey={itemKey}
              setModalOpen={setModalOpen}
            />
          </div>
        )}
      </div>
    );
  }
  return null;
};

export default Overlay;
