import { useEffect } from "react";
import Logo from "../components/Logo";
import { useGuessy } from "../contexts/useGuessy";

function RoomLoading({ setLoadingPage }) {
  const { guessyManager } = useGuessy();
  useEffect(() => {
    setTimeout(() => {
      guessyManager("joinRoom");
    }, 5000);
  });
  return (
    <div>
      <Logo spin={true} />
      <h3 className="heading">Loading room...</h3>
    </div>
  );
}

export default RoomLoading;
