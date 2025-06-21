import { useContext } from "react";
import { WSContext } from "./WSContext";

function useWS() {
  const context = useContext(WSContext);
  if (context === undefined)
    throw new Error("WSContext was used outside of the WSProvider");
  return context;
}

export { useWS };