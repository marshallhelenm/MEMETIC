import { useState, useEffect } from "react";
import { Card, Dimmer, DimmerDimmable, Icon } from "semantic-ui-react";
import "../App.css";
import StubImage from "./StubImage"

function Stub ({item, roomKey}) {
  const [dimmer, setDimmer] = useState(false);
  const storageId = `${roomKey}-${item.stub}`

  function setStubStatus(status) {
    localStorage.setItem(storageId, status);
    status === "dimmed" ? setDimmer(true) : setDimmer(false);
  }

  function flip(e){
    e.preventDefault();
    const newStatus = dimmer ? "visible" : "dimmed"
    setStubStatus(newStatus);
    setDimmer(!dimmer)
  }

  useEffect(() => {
    function getStubStatus(){
      return localStorage.getItem(storageId)
    }

    if (getStubStatus() === "dimmed") {
      setDimmer(true);
    } else {
      setDimmer(false);
    }
  }, [setDimmer, storageId]);

  return (
    <Card raised id={item.id}>
      <div className="stub">
        <div className="stub-origin ui icon">
          <a href={item.origin} target="_blank" rel="noopener noreferrer">
            <Icon name='question' />
            <span className="tooltip">Origin</span>
          </a>
        </div>
        <DimmerDimmable dimmed={dimmer}>
          <StubImage item={item} flip={flip} />
          <Dimmer active={dimmer} onClickOutside={flip}/>
        </DimmerDimmable>
      </div>
    </Card>
  );
}

export default Stub;
