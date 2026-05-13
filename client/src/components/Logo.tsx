import React, { useState } from "react";
import { Link } from "react-router-dom";
import Zoom from "@mui/material/Zoom";
import Fade from "@mui/material/Fade";
import question from "../assets/question.png";

interface LogoProps {
  header?: boolean;
  size?: string;
  spin?: boolean;
}

const Logo: React.FC<LogoProps> = ({ spin = true, header = false, size }) => {
  const [image, setImage] = useState<string>(question);
  const [fade, setFade] = useState(false);

  function spinTimeUp() {
    // Animation logic would go here if using jQuery or CSS transitions
    setFade(true);
    setImage("gnome");
  }

  if (header) {
    return (
      <div className="small-logo">
        <Link to="/">
          <img
            src={question}
            alt={`a ${spin ? "spinning " : ""}question mark`}
            className={`${spin ? `guessy-logo-spin` : ""}`}
            id="logo-image"
          />
        </Link>
      </div>
    );
  } else if (image === "gnome") {
    return (
      <div style={{ height: '40vmin', cursor: "pointer" }}>
        <Zoom in={true} style={{ transitionDelay: "100ms" }}>
          <img
            src="/memes/gnome_barf.gif"
            alt={
              "a gif of a gnome from the cartoon Gravity Falls barfing up a rainbow continuously"
            }
            className="corners"
            onClick={() => {
              setImage(question);
              setFade(false);
            }}
          />
        </Zoom>
      </div>
    );
  } else {
    return (
      <div
        onClick={spin ? spinTimeUp : undefined}
        style={{ cursor: "pointer", height: "40vmin" }}
      >
        <Fade in={!fade}>
          <img
            src={image}
            alt={`a ${spin ? "spinning " : ""}question mark`}
            className={`${spin ? `guessy-logo-spin` : ""} ${
              size === "small" ? "small-logo" : ""
            }`}
          />
        </Fade>
      </div>
    );
  }
};

export default Logo;
