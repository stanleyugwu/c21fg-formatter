import React, { useState } from "react";
import File from '../components/File';
import "../styles/components/App.css";

const App = () => {

  const [noFileError, setNoFileError] = useState(false);
  const [invalidFileError, setInvalidFileError] = useState(false);
  const [validFiles, setValidFiles] = useState([]);

  const formats = ['.docx','.txt','.doc'];

  //Extract file extension
  const getExtension = (name) => {
    name = String(name);
    return name.substr(name.lastIndexOf('.'), name.length)
  }

  //hide error periodically
  const scheduleErrorDismiss = (time) => {
    setTimeout(() => {setNoFileError(false)}, time || 2000);
    return true
  }

  //delete file
  const deleteFile = (e,filename) => {
    setValidFiles(validFiles.filter(file => file.name !== filename));
  }

  //handle files selection
  const handleFileLoad = (e) => {
    const files = Array.from(e.target.files);//files selected
    if(!files.length){
      //show error if no file was selected
      setNoFileError(true);
    }else{
      setNoFileError(false);
      //show Error if no valid file were selected
      const allInvalid = files.every(file => {
        const ext = getExtension(file.name);

        return formats.indexOf(ext) === -1
      });

      //no valid file uploaded
      if(allInvalid){
        setInvalidFileError(true);//show error
      }else{
        setInvalidFileError(false);//hide error
        //collect vaid files
        var valid = files.filter((file) => {
          const ext = getExtension(file.name);
          //a valid file and file not already uploaded
          return formats.indexOf(ext) !== -1;
        });
        setValidFiles([...validFiles,...valid]);
      }
    }
  }

  return (
    <div className="container-fluid App">
      <div className="row">
        <div className="col-12 text-center">
          <h5>Click {'"Upload Files"'} button or Drag files into the box below to upload</h5>
          <p className="lead text-warning small">
            Note:: File(s) must be either in .doc or .txt format
          </p>
        </div>
        <div className="col-md-8 col-lg-10 mx-auto">
            <div className="form-group file-upload-form">
              <label labelFor="files" className="upload-section p-2">
                <input
                  type="file"
                  id="files"
                  required
                  onChange={handleFileLoad}
                  className="file-input"
                  multiple
                  placeholder="Upload .doc or .txt files"
                  name="files"
                />
                <div className="col-12 text-center">
                  <p className="btn upload-btn lead"><b>Upload Files</b></p>
                </div>
              </label>
            </div>
            {noFileError && scheduleErrorDismiss() && (
              <div className="col-12 text-center">
                <p className="lead text-danger">Please Select A File</p>
              </div>
            )}
            {invalidFileError && (
              <div className="col-12 text-center">
                <p className="lead text-danger">Please Upload files that has .docx, .doc, or .txt extension!</p>
              </div>
            )}
            {/* Uploaded Files Display*/}
            <div className="col-12 text-left files-display">
              <h5>Uploaded Files:</h5>
              {!validFiles.length && <small>None</small>}
              <ul className="files-list mt-4">
                {validFiles.map((file,idx) => {
                  return (
                    <li className="text-left mt-2" key={idx}>
                      <File data={file} handleDelete={deleteFile}/>
                    </li>
                  )
                })}
              </ul>
            </div>
            {/* <div className="form-group mt-5 cta-btn-wrapper">
              <button
                className="btn btn-block btn-primary format-btn col-md-7 col-lg-5 col-sm-4 mx-auto p-3"
                type="button" disabled={!validFiles.length} onClick={(e) => {setFormatAll(true)}}
              >
                Format All
              </button>
            </div> */}
        </div>
      </div>
    </div>
  );
};

export default App;
