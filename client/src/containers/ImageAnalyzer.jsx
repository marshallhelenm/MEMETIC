import "../App.css";
import { useEffect } from "react";
import $ from 'jquery'
import { memeData } from "../assets/memeCollection";
//The first page you see. Holds options to join a game or start a new game.
function ImageAnalyzer() {

  let workingData = {...memeData}

  function generateImages(){
    let imgs = []
    Object.keys(memeData).forEach((itemKey) => (
      imgs.unshift(
        <img id={itemKey} src={`/memes/${memeData[itemKey]['img']}`}></img>
      )
    ))
    return imgs
  }

  function getDimensions(){
    let image;
    let w;
    let h;
    Object.keys(memeData).forEach((itemKey) => {
      image = $(`#${itemKey}`)[0]
      w = image.width
      h = image.height
      delete workingData[itemKey]['height']
      delete workingData[itemKey]['width']
       workingData[itemKey]['height_multiplier'] = (w/h).toFixed(2)
    })
    $('#new_json').val(JSON.stringify(workingData));
  }

  return (
    <div>
      <div>
        <button id="getDimensionsButton" onClick={getDimensions}>Get Dimensions</button>
        <textarea className="form-control" rows='35' cols='120' id="new_json"></textarea>
      </div>
      <div>
        {generateImages()}
      </div>
    </div>
  );
}

export default ImageAnalyzer;
