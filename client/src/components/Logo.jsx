import { Link } from "react-router-dom";
import Zoom from "@mui/material/Zoom";
import Fade from "@mui/material/Fade";
import $ from "jquery";

import question from "../assets/question.png";
import { useState } from "react";

function Logo({ spin = true, header = false, size }) {
  const [image, setImage] = useState(question);
  const [fade, setFade] = useState(false);

  function spinTimeUp() {
    const spinner = $(".guessy-logo-spin");
    let spinTime = spinner.css("animation-duration");
    spinTime = Number(spinTime.replace("s", ""));
    if (spinTime > 5) {
      spinner.css("animation-duration", "3s");
    } else if (spinTime > 1) {
      spinner.css("animation-duration", `${spinTime / 2}s`);
    } else if (spinTime.toFixed(1) > 0.1) {
      spinner.css("animation-duration", `${spinTime - 0.1}s`);
    } else {
      spinner.css("animation-duration", "0s");
      setFade(true);
      setTimeout(() => {
        setImage("gnome");
      }, 500);
    }
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
  } else if (image == "gnome") {
    return (
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
    );
  } else {
    return (
      <div
        onClick={spin && spinTimeUp}
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
}

export default Logo;
