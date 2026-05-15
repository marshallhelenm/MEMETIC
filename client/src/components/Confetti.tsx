import React, { useEffect, useState } from "react";
import { ConfettiExplosion } from "react-confetti-explosion";

const Confetti: React.FC = () => {
  const [splodin, setSplodin] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSplodin(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

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
  return null;
};

export default Confetti;
