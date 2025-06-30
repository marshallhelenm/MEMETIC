import "../App.css";
import * as XLSX from "xlsx";
import { devLog } from "../utils/Helpers";
import $ from "jquery";
import memes from "../assets/memes.json";

function Upload() {
  let processedData = null;
  function guessifyData(jsonObject) {
    let data = {};
    Object.keys(jsonObject).forEach((key) => {
      let meme = jsonObject[key];
      console.log(meme.title);

      data[meme.tag] = {
        title: meme.title || "",
        img: `${meme.tag}.${meme.ext || "jpg"}`,
        origin: meme.origin || "",
        alt: meme.alt || "",
        height_multiplier: 1,
      };
    });
    let allData = { ...memes, ...data };
    let sortedData = {};
    Object.keys(allData)
      .sort()
      .forEach((key) => (sortedData[key] = allData[key]));
    processedData = JSON.stringify(sortedData);
    return processedData;
  }

  var ExcelToJSON = function () {
    this.parseExcel = function (file) {
      var reader = new FileReader();

      reader.onload = function (e) {
        var data = e.target.result;
        var workbook = XLSX.read(data, {
          type: "binary",
        });
        workbook.SheetNames.forEach(function (sheetName) {
          // Here is your object
          var XL_row_object = XLSX.utils.sheet_to_row_object_array(
            workbook.Sheets[sheetName]
          );
          devLog(XL_row_object);
          $("#xlx_json").val(guessifyData(XL_row_object));
          return;
        });
      };

      reader.onerror = function (ex) {
        devLog(ex);
      };

      reader.readAsBinaryString(file);
    };
  };

  function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object
    var xl2json = new ExcelToJSON();
    xl2json.parseExcel(files[0]);
  }

  return (
    <div>
      <form encType="multipart/form-data">
        <input
          id="upload"
          type="file"
          name="files[]"
          onChange={handleFileSelect}
        />
      </form>
      <i
        className={`fa-solid fa-xl fa-copy`}
        style={{ marginLeft: "2%", cursor: "pointer" }}
        onClick={() => {
          navigator.clipboard.writeText(processedData);
        }}
      ></i>
      <textarea
        className="form-control"
        rows="35"
        cols="120"
        id="xlx_json"
      ></textarea>
    </div>
  );
}

export default Upload;
