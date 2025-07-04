import PropTypes from "prop-types";
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
      spinner.css("animation-duration", `${spinTime - 0.2}s`);
    } else {
      spinner.css("animation-duration", "0s");
      setFade(true);
      setImage("gnome");
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
      <div style={{ height: '"40vmin"', cursor: "pointer" }}>
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
}

Logo.propTypes = {
  header: PropTypes.bool,
  size: PropTypes.string,
  spin: PropTypes.bool,
};

export default Logo;
