import React, { useState } from "react";
import MemeCardImage from "../card/MemeCardImage";
import Overlay from "./Overlay";
import { colorE, colorG } from "../assets/styles";
import goldStar from "../assets/goldStar.png";
import { Tooltip } from "@mui/material";
import { usePlayers } from "../hooks/useContextHooks";
import type { MemeData } from "../types/meme";

interface MemeCardFrontProps {
  itemKey: string;
  item: MemeData;
  isPlayerCard: boolean;
  flip: (e: React.MouseEvent) => void;
  height: number;
  cardWidth: number;
}

const MemeCardFront: React.FC<MemeCardFrontProps> = ({ itemKey, item, isPlayerCard, flip, height, cardWidth }) => {
  const [overlay, setOverlay] = useState<boolean>(false);
  const { isObserver } = usePlayers();
  function playerStar() {
    if (!isPlayerCard || isObserver) return null;
    return (
      <Tooltip title="This is your meme!" placement="right-end">
        <img src={goldStar} className="player-card-star absolute" />
      </Tooltip>
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
          width: `${cardWidth}px`,
          backgroundImage: "images/bgq1.png",
          backgroundColor: isPlayerCard && !isObserver ? colorG : colorE,
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={flip}
        onMouseEnter={() => setOverlay(true)}
        onMouseLeave={() => setOverlay(false)}
      >
        <Overlay item={item} overlay={overlay} itemKey={itemKey} />
        <MemeCardImage
          item={item}
          flipped={false}
          height={height}
        />
      </div>
    </>
  );
};

export default MemeCardFront;
