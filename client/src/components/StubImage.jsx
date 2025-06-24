import ReactFreezeframe from "react-freezeframe"
import { useGuessy } from "../contexts/useGuessy";
import question from "../assets/question.png"

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
      <ReactFreezeframe className="stub-image">{imgElement}</ReactFreezeframe>
    );
  } else {
    return <>{imgElement}</>;
  }
}

export default StubImage;
