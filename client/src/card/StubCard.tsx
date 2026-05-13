import React, { useState } from "react";
import ReactCardFlip from "react-card-flip";

import StubBack from "./StubBack";
import StubFront from "./StubFront";
import { usePlayers } from "../hooks/useContextHooks";
import type { MemeData } from "../types/meme";


interface StubCardProps {
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

const StubCard: React.FC<StubCardProps> = ({ roomKey, itemKey, item }) => {
  const { myPlayerCard } = usePlayers();
  const isPlayerCard = itemKey === myPlayerCard;
  const storageId = `${roomKey}-flipped-${itemKey}`;
  const [flipped, setFlipped] = useState<boolean>(
    sessionStorage.getItem(storageId) === "true"
  );
  const height = 200 * item.height_multiplier + 2;

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
        <StubFront
          itemKey={itemKey}
          item={item}
          isPlayerCard={isPlayerCard}
          flip={flip}
          height={height}
        />
        <StubBack
          itemKey={itemKey}
          item={item}
          isPlayerCard={isPlayerCard}
          flip={flip}
          height={height}
        />
      </TypedReactCardFlip>
    </div>
  );
};

export default StubCard;
