import React, { useState } from "react";
import ReactCardFlip from "../utils/ReactCardFlip";

import MemeCardBack from "./MemeCardBack";
import MemeCardFront from "./MemeCardFront";
import { useGame, usePlayers } from "../hooks/useContextHooks";
import type { MemeData } from "../types/meme";


interface MemeCardProps {
  roomKey: string | null;
  itemKey: string;
  item: MemeData;
}

// Local type for ReactCardFlip props (copied from package)
type LocalReactFlipCardProps = {
  cardZIndex?: string;
  containerStyle?: {};
  containerClassName?: string;
  isFlipped?: boolean;
  flipSpeedBackToFront?: number;
  flipSpeedFrontToBack?: number;
  cardStyles?: { front?: {}; back?: {} };
  infinite?: boolean;
  flipDirection?: 'horizontal' | 'vertical';
  children: [React.ReactNode, React.ReactNode];
};

const MemeCard: React.FC<MemeCardProps> = ({ roomKey, itemKey, item }) => {
  const { columnWidth } = useGame();
  const { myPlayerCard } = usePlayers();
  const isPlayerCard = itemKey === myPlayerCard;
  const storageId = `${roomKey}-flipped-${itemKey}`;
  const [flipped, setFlipped] = useState<boolean>(
    sessionStorage.getItem(storageId) === "true"
  );

  const cardWidth = Math.floor(columnWidth);

  const height = cardWidth * item.height_multiplier + 2;

  function flip(e: React.MouseEvent) {
    e.preventDefault();
    window.sessionStorage.setItem(storageId, String(!flipped));
    setFlipped(!flipped);
  }

  // Type assertion to help TypeScript recognize ReactCardFlip as a functional component
  const TypedReactCardFlip = ReactCardFlip as unknown as React.FC<LocalReactFlipCardProps>;
  return (
    <div
      style={{
        height: height,
        position: "relative",
        display: "inline-block",
        marginBottom: "10px",
      }}
    >
      <TypedReactCardFlip
        isFlipped={flipped}
        flipDirection="horizontal"
      >
        <MemeCardFront
          itemKey={itemKey}
          item={item}
          isPlayerCard={isPlayerCard}
          flip={flip}
          height={height}
          cardWidth={cardWidth}
        />
        <MemeCardBack
          itemKey={itemKey}
          item={item}
          isPlayerCard={isPlayerCard}
          flip={flip}
          height={height}
          cardWidth={cardWidth}
        />
      </TypedReactCardFlip>
    </div>
  );
};

export default MemeCard;
