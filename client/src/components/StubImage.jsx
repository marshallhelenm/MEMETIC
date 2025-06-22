import ReactFreezeframe from "react-freezeframe"
import { useGuessy } from "../contexts/useGuessy";
import question from "../assets/question.png"

function StubImage ({item, flip, flipped}) {
  const {staticGifs} = useGuessy()
  
  if (flipped){
    return (<img
      src={question}
      alt={`a question mark`}
      onClick={flip} 
      className="stub-image ui medium image"
      />)
  } else if (staticGifs && item.img.includes(".gif")){
    return (
      <ReactFreezeframe className="stub-image">
        <img src={`/memes/${item.img}`} alt={item.alt} onClick={flip} className="stub-image" />
      </ReactFreezeframe>
    );
  } else {
    return (
      <img src={`/memes/${item.img}`} alt={item.alt} onClick={flip} className="stub-image" />
    );
  }
}

export default StubImage;
