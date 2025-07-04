import PropTypes from "prop-types";

import StubImage from "./StubImage";
import { colorD, colorG } from "../assets/styles";

function StubBack({ itemKey, item, isPlayerCard, flip, height }) {
  return (
    <div
      className={`stub`}
      id={itemKey}
      style={{
        height: `${height}px`,
        backgroundImage: "images/bgq1.png",
        backgroundColor: isPlayerCard ? colorG : colorD,
      }}
      onClick={flip}
    >
      <StubImage
        item={item}
        flip={flip}
        flipped={true}
        height={height}
        isPlayerCard={isPlayerCard}
      />
    </div>
  );
}

StubBack.propTypes = {
  flip: PropTypes.func,
  height: PropTypes.number,
  isPlayerCard: PropTypes.bool,
  item: PropTypes.shape({
    alt: PropTypes.string,
    img: PropTypes.string,
    title: PropTypes.string,
  }),
  itemKey: PropTypes.string,
};

export default StubBack;
