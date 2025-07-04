import $ from "jquery";

import memes from "../assets/memes.json";

function ImageAnalyzer() {
  const imgKeys = ["pull_the_trigger_piglet"];
  const allKeys = Object.keys(memes);
  const keys = imgKeys.length > 0 ? imgKeys : allKeys;
  let workingData = { ...memes };

  function generateImages() {
    let imgs = [];
    keys.forEach((itemKey) => {
      imgs.unshift(
        <img id={itemKey} src={`/memes/${memes[itemKey]["img"]}`}></img>
      );
    });
    return imgs;
  }

  function getDimensions() {
    let image;
    let w;
    let h;
    keys.forEach((itemKey) => {
      image = $(`#${itemKey}`)[0];
      w = image.width;
      h = image.height;
      if (!workingData[itemKey]) {
        console.log(itemKey);
      } else {
        workingData[itemKey]["height_multiplier"] = 1 / (w / h).toFixed(2);
      }
    });
    let newData = {};
    keys.sort().forEach((itemKey) => {
      newData[itemKey] = workingData[itemKey];
    });
    $("#new_json").val(JSON.stringify(newData));
  }

  return (
    <div>
      <div>
        <button id="getDimensionsButton" onClick={getDimensions}>
          Get Dimensions
        </button>
      </div>
      <div>
        <textarea
          className="form-control"
          rows="35"
          cols="120"
          id="new_json"
        ></textarea>
      </div>
      <div
        style={{
          maxWidth: "90vw",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {generateImages()}
      </div>
    </div>
  );
}

export default ImageAnalyzer;
