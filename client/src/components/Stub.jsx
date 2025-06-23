import { useState, useEffect, useMemo } from "react";
import "../App.css";
import StubImage from "./StubImage"
import question from "../assets/question.png"
import $ from 'jquery'

function Stub ({itemKey, item, roomKey}) {
  const [flipped, setFlipped] = useState(false);
  const [overlay, setOverlay] = useState(false)
  const storageId = `${roomKey}-${item.stub}`
  const height = (200 / item.height_multiplier) + 2

  function setStubStatus(status) {
    localStorage.setItem(storageId, status);
    status === "flipped" ? setFlipped(true) : setFlipped(false);
  }

  function generateOverlay(){
    if (!flipped && overlay) {
      return (
        <div className="stub-origin">
          <a href={item.origin} target="_blank" rel="noopener noreferrer">
            <i className="fa-solid fa-question"></i>
            <span className="tooltip">Origin</span>
          </a>
        </div>
      )
    }
  }

  function flip(e){
    e.preventDefault();
    const newStatus = flipped ? "visible" : "flipped"
    setStubStatus(newStatus);
    setFlipped(!flipped)
  }

  useEffect(() => {
    if (localStorage.getItem(storageId) === "flipped") {
      setFlipped(true);
    } else {
      setFlipped(false);
    }
    
  }, [setFlipped, storageId]);

  return (
    <div className="stub" id={itemKey} style={{height: `${height}px`}} onClick={flip} onMouseEnter={()=>setOverlay(true)} onMouseLeave={()=>setOverlay(false)}>
      {generateOverlay()}      
        <StubImage item={item} flip={flip} flipped={flipped} itemKey={itemKey} height={height} />
    </div>
  );

}

export default Stub;
