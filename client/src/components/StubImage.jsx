import ReactFreezeframe from "react-freezeframe"
import { useGuessy } from "../contexts/useGuessy";
import question from "../assets/question.png"

function StubImage ({item, flipped, height}) {
  const {staticGifs} = useGuessy()
  if (flipped){
    return (<img
      src={question}
      alt={`a question mark`}
      className="stub-image back"
      style={{height: height/2}}
      />)
  } else if (staticGifs && item.img.includes(".gif")){
    return (
      <ReactFreezeframe className="stub-image">
        <img src={`/memes/${item.img}`} alt={item.alt} className="stub-image" />
      </ReactFreezeframe>
    );
  } else {
    return (
      <img src={`/memes/${item.img}`} alt={item.alt} className="stub-image" />
    );
  }
}

export default StubImage;
