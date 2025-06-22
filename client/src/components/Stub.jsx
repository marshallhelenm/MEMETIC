import { useState, useEffect } from "react";
import "../App.css";
import StubImage from "./StubImage"
import question from "../assets/question.png"
import $ from 'jquery'

function Stub ({itemKey, item, roomKey}) {
  const [flipped, setFlipped] = useState(false);
  const storageId = `${roomKey}-${item.stub}`

  function width() {
    return $(`img#${itemKey}`).get(0).naturalWidth;
  }
  function height() {
    return document.getElementById(itemKey).getElementByTagName('img').naturalHeight;
  }

  function setStubStatus(status) {
    localStorage.setItem(storageId, status);
    status === "flipped" ? setFlipped(true) : setFlipped(false);
  }

  function overlay(){
    if (!flipped) {
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
    <div className="stub" id={itemKey}>
      {overlay()}      
      <StubImage item={item} flip={flip} flipped={flipped} />
      <img/>
    </div>
  );

}

export default Stub;
