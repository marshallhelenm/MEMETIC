import { useContext } from "react";
import { PlayersContext } from "../contexts/PlayersContext";
import { GameContext } from "../contexts/GameContext";
import { WSContext } from "../contexts/WSContext";

import type { GameContextValue } from "../contexts/GameContext";
import type { PlayersContextValue } from "../contexts/PlayersContext";
import type { WSContextValue } from "../contexts/WSContext";

function useGame(): GameContextValue {
  const context = useContext(GameContext);
  if (context === undefined)
    throw new Error("GameContext was used outside of the GameProvider");
  return context;
}

function usePlayers(): PlayersContextValue {
  const context = useContext(PlayersContext);
  if (context === undefined)
    throw new Error("PlayersContext was used outside of the PlayersProvider");
  return context;
}

function useWS(): WSContextValue {
  const context = useContext(WSContext);
  if (context === undefined)
    throw new Error("WSContext was used outside of the WSProvider");
  return context;
}

export { usePlayers, useGame, useWS };
