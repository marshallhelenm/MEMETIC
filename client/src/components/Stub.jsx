import { useState, useEffect } from "react";
import { Dimmer, DimmerDimmable } from "semantic-ui-react";
import {Paper} from '@mui/material';
import "../App.css";
import StubImage from "./StubImage"

function Stub ({itemKey, item, roomKey}) {
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
    if (localStorage.getItem(storageId) === "dimmed") {
      setDimmer(true);
    } else {
      setDimmer(false);
    }
  }, [setDimmer, storageId]);

  return (
    <Paper raised id={itemKey}>
      <div className="stub">
        <div className="stub-origin">
          <a href={item.origin} target="_blank" rel="noopener noreferrer">
            <i className="fa-solid fa-question-mark"></i>
            <span className="tooltip">Origin</span>
          </a>
        </div>
        <DimmerDimmable dimmed={dimmer}>
          <StubImage item={item} flip={flip} />
          <Dimmer active={dimmer} onClickOutside={flip}/>
        </DimmerDimmable>
      </div>
    </Paper>
  );

}

export default Stub;
