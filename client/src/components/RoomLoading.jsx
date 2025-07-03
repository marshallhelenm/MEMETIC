import { useEffect } from "react";

import Logo from "../components/Logo";

function RoomLoading({ joinRoom }) {
  useEffect(() => {
    setTimeout(() => {
      joinRoom();
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
