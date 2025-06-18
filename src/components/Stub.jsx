import { useState, useEffect } from "react";
import { Card, Button, Dimmer, DimmerDimmable, CardContent, CardHeader, Image, Icon } from "semantic-ui-react";
import "../App.css";

function Stub ({item, roomKey}) {
  const [dimmer, setDimmer] = useState(false);
  const storageId = `${roomKey}-${item.stub}`

  function setStubStatus(status) {
    localStorage.setItem(storageId, status);
    status === "dimmed" ? setDimmer(true) : setDimmer(false);
  }

  function getStubStatus(){
    return localStorage.getItem(storageId)
  }

  function flip(e){
    e.preventDefault();
    const newStatus = dimmer ? "visible" : "dimmed"
    setStubStatus(newStatus);
    setDimmer(!dimmer)
  }

  useEffect(() => {
    if (getStubStatus() === "dimmed") {
      setDimmer(true);
    } else {
      setDimmer(false);
    }
  }, []);

  return (
    <Card raised id={item.id}>
      <div className="stub-origin">
        <a href={item.origin} target="_blank" rel="noopener noreferrer" className="origin-link">
          <Icon name='question' />
        </a>
      </div>
      <DimmerDimmable dimmed={dimmer}>
        <Image src={item.img} alt={item.alt} onClick={flip} className="stub-image" />
        <Dimmer active={dimmer} onClickOutside={flip}/>
      </DimmerDimmable>
    </Card>
  );
}

export default Stub;
