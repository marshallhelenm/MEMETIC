import $ from "jquery";
import { memeData } from "../assets/memeCollection";

function ImageAnalyzer() {
  const imgKeys = ["gnome_barf"];
  const allKeys = Object.keys(memeData);
  const keys = imgKeys.length > 0 ? imgKeys : allKeys;
  let workingData = { ...memeData };

  function generateImages() {
    let imgs = [];
    keys.forEach((itemKey) =>
      imgs.unshift(
        <img id={itemKey} src={`/memes/${memeData[itemKey]["img"]}`}></img>
      )
    );
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
      workingData[itemKey]["height_multiplier"] = 1 / (w / h).toFixed(2);
    });
    $("#new_json").val(JSON.stringify(workingData));
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
