import { lazy } from "react";
import PropTypes from "prop-types";

const ReactFreezeframe = lazy(() => import("react-freezeframe"));
import { colorE } from "../assets/styles";
import { GuessySuspense } from "../components/GuessySuspense";

function StubImage({ item, flipped, height }) {
  const staticGifs = sessionStorage.getItem("guessy-gifs") === "true";

  const imgElement = (
    <img
      src={`/memes/${item.img}`}
      alt={item.alt || item.title}
      className="stub-image pointer"
    />
  );

  if (flipped) {
    return (
      <div
        className={`stub-back`}
        style={{
          height: height * 0.9,
          margin: height * 0.05,
        }}
      ></div>
    );
  } else if (staticGifs && item.img.includes(".gif")) {
    return (
      <div>
        <i
          className={`fa-solid fa-md fa-hand-sparkles absolute`}
          style={{
            right: 0,
            zIndex: 150,
            color: colorE,
            margin: "5%",
            opacity: 0.8,
          }}
          alt="gif indicator"
        ></i>
        <GuessySuspense>
          <ReactFreezeframe className="stub-image pointer">
            {imgElement}
          </ReactFreezeframe>
        </GuessySuspense>
      </div>
    );
  } else {
    return <div>{imgElement}</div>;
  }
}

StubImage.propTypes = {
  flipped: PropTypes.bool,
  height: PropTypes.number,
  item: PropTypes.shape({
    alt: PropTypes.string,
    img: PropTypes.string,
    title: PropTypes.string,
  }),
};

export default StubImage;
