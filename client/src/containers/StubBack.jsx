import StubImage from "../components/StubImage";
import { colorD, colorG } from "../assets/styles";

function Stub({ itemKey, item, isPlayerCard, flip, height }) {
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

export default Stub;
