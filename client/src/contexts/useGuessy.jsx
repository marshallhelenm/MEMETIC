import { useContext } from "react";
import { GuessyContext } from "./GuessyContext";

function useGuessy() {
  const context = useContext(GuessyContext);
  if (context === undefined)
    throw new Error("GuessyContext was used outside of the GuessyProvider");
  return context;
}

export { useGuessy };