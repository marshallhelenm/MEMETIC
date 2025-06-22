import { useState, useEffect, useMemo } from "react";
import "../App.css";
import StubImage from "./StubImage"
import question from "../assets/question.png"
import $ from 'jquery'

function Stub ({itemKey, item, roomKey}) {
  const [flipped, setFlipped] = useState(false);
  // const [height, setHeight] = useState();
  const storageId = `${roomKey}-${item.stub}`

  // function calcHeight(){
  //   const h = ($(`img[src$='${item.img}']`)[0]?.height)*1.03
  //   if (height != h){
  //     setHeight(h)
  //   }
  // }

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
    <div className="stub" id={itemKey} >
      {overlay()}      
      <StubImage item={item} flip={flip} flipped={flipped} itemKey={itemKey}/>
      <img/>
    </div>
  );

}

export default Stub;
