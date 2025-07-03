import { useContext } from "react";
import { PlayersContext } from "./PlayersContext";
import { GameContext } from "./GameContext";
import { WSContext } from "./WSContext";

function useGame() {
  const context = useContext(GameContext);
  if (context === undefined)
    throw new Error("GameContext was used outside of the GameProvider");
  return context;
}

function usePlayers() {
  const context = useContext(PlayersContext);
  if (context === undefined)
    throw new Error("PlayersContext was used outside of the PlayersProvider");
  return context;
}

function useWS() {
  const context = useContext(WSContext);
  if (context === undefined)
    throw new Error("WSContext was used outside of the WSProvider");
  return context;
}

export { usePlayers, useGame, useWS };
