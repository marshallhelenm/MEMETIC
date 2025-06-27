import "../App.css";
import * as XLSX from "xlsx";
import { devLog } from "../utils/Helpers";
import $ from "jquery";

function Upload() {
  function guessifyJson(jsonObject) {
    let data = {};
    Object.keys(jsonObject).forEach((key) => {
      let meme = jsonObject[key];
      data[key] = {
        img: `${meme.img}.${meme.ext}`,
        origin: meme.origin || "",
        alt: meme.alt || "",
        height_multiplier: 1,
      };
    });
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
          var json_object = JSON.stringify(XL_row_object);
          devLog(json_object);
          $("#xlx_json").val(guessifyJson(json_object));
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
