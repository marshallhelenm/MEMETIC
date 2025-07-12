import React from "react";
import { useEffect, useState } from "react";
import ConfettiExplosion from "react-confetti-explosion";

function Confetti() {
  const [splodin, setSplodin] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setSplodin(false);
    }, 10000);
  });

  if (splodin) {
    return (
      <ConfettiExplosion
        force={1.0}
        zIndex={9999999}
        height="150vh"
        duration={5000}
        particleCount={1000}
      />
    );
  }
}

export default Confetti;
