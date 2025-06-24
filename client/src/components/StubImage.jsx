import ReactFreezeframe from "react-freezeframe"
import { useGuessy } from "../contexts/useGuessy";
import question from "../assets/question.png"
import { colorE } from "../assets/styles";

function StubImage({ item, flipped, height, children }) {
  const { staticGifs } = useGuessy();
  const imgElement = flipped ? (
    <img
      src={question}
      alt={`a question mark`}
      className="stub-image back"
      style={{ height: height / 2 }}
    />
  ) : (
    <img src={`/memes/${item.img}`} alt={item.alt} className="stub-image" />
  );
  if (staticGifs && item.img.includes(".gif")) {
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

        <ReactFreezeframe className="stub-image">{imgElement}</ReactFreezeframe>
      </div>
    );
  } else {
    return <>{imgElement}</>;
  }
}

export default StubImage;
