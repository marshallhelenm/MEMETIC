import ReactFreezeframe from "react-freezeframe";
import { useGuessy } from "../contexts/useGuessy";
import { colorE } from "../assets/styles";

function StubImage({ item, flipped, height }) {
  const { staticGifs } = useGuessy();
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
        <ReactFreezeframe className="stub-image pointer">
          {imgElement}
        </ReactFreezeframe>
      </div>
    );
  } else {
    return <div>{imgElement}</div>;
  }
}

export default StubImage;
