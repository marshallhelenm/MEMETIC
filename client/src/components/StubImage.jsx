import ReactFreezeframe from "react-freezeframe"
import { useGuessy } from "../contexts/useGuessy";

function StubImage ({item, flip}) {
  const {staticGifs} = useGuessy()
  
  if (staticGifs && item.img.includes(".gif")){
    return (
      <ReactFreezeframe className="stub-image">
        <img src={`/memes/${item.img}`} alt={item.alt} onClick={flip} className="stub-image ui medium image" />
      </ReactFreezeframe>
    );
  } else {
    return (
      <img src={`/memes/${item.img}`} alt={item.alt} onClick={flip} className="stub-image ui medium image" />
    );
  }
}

export default StubImage;
