import "../App.css";
import * as XLSX from 'xlsx';
import $ from 'jquery'

function Upload() {
    var ExcelToJSON = function() {
        this.parseExcel = function(file) {
        var reader = new FileReader();

        reader.onload = function(e) {
            var data = e.target.result;
            var workbook = XLSX.read(data, {
            type: 'binary'
            });
            workbook.SheetNames.forEach(function(sheetName) {
            // Here is your object
            var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
            var json_object = JSON.stringify(XL_row_object);
            console.log(JSON.parse(json_object));
            $('#xlx_json').val(json_object);
            })
        };

        reader.onerror = function(ex) {
            console.log(ex);
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
            <input id="upload" type='file' name="files[]" onChange={handleFileSelect}/>
        </form>
        <textarea className="form-control" rows='35' cols='120' id="xlx_json"></textarea>
      </div>
    );
}

export default Upload;
