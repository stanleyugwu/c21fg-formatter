/* eslint-disable react/prop-types */
import React, {useRef, useState} from 'react';
import '../styles/components/File.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCloudDownloadAlt, faSpinner, faTrashAlt,faQuestionCircle } from '@fortawesome/free-solid-svg-icons'

 //Format File Size
 const formatFileSize = (bytes, decimalPoint) => {
    if(bytes == 0) return '0 Bytes';
    var k = 1000,
    dm = decimalPoint || 2,
    sizes = ['Bytes','KB','MB','GB','TB','PB','EB','ZB','YB'],
    i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  }

//File Component
const File = (props) => {

    const [formatting, setFormatting] = useState(false);
    const [formatted, setFormatted] = useState(false);
    const [formatError, setFormatError] = useState(false);
    const FileRef = useRef();

    //download formatted file by opening a new windows
    // couldnt use fetch to download when using res.download on the server
    const downloadFile = () => {
        window.open('/download');
    }

    //format file
    const formatFile = () => {
        setFormatting(true);
        //set the groupBy value, i.e how much to group the numbers in the file
        var groupBy = FileRef.current.querySelector('.groupBy').value;
        groupBy = (Number(groupBy) >= 10 && Number(groupBy) <= 500) ? groupBy : 10;

        //set the countPerLine, i.e numbers per line in file
        var countPerLine = FileRef.current.querySelector('.countPerLine').value;
        countPerLine = (Number(countPerLine) >= 5 && Number(countPerLine) <= 100) ? countPerLine : 5;

        const formData = new FormData();
        formData.append('file', props.data)
        formData.append('options',JSON.stringify({groupBy,countPerLine}));

        //convert
        fetch('/upload', {method:"POST",body:formData}).then(res => {
            return res.json()
        }).then(({formatted} = false) => {
            if(formatted){
                setFormatted(true);
                setFormatting(false);
            }else{
                return Error('Format Error')
            }
        }).catch(e => {
            console.log(e);
            setFormatError(true);
        });
    }

    return (
    <div className="File row" ref={FileRef}>
        <div className="filename-wrapper col-sm-6 col-md-4 col-lg-5">
            {props.data.name}
            <small> - <b>{formatFileSize(props.data.size)}</b></small>
        </div>

        <div className="filetools-wrapper col-sm-6 col-md-8 col-lg-7">
            
            {/* Help */}
            <span className="help-icon" onClick={() => alert('Use the first textbox to specify how to group the numbers in the file e.g 100.\nUse the second textbox to specify how many numbers to write per line in the file.')}>
                <FontAwesomeIcon icon={faQuestionCircle}/>
            </span>

            {/* TextBoxes */}
            {!formatting && !formatted && (
            <>
                <input type="number" min={10} max={500} defaultValue={100} className="groupBy ml-3"/>
                <input type="number" min={5} max={100} defaultValue={10} className="countPerLine ml-3"/>
            </>
            )}

            {/* Formatting Spinner */}
            {formatting && !formatError && (
                <span>
                    <small>Formatting </small> 
                    <FontAwesomeIcon icon={faSpinner} spin/>
                </span>)
            }

            {/* Format Button */}
            {!formatting && !formatted && (
                <button onClick={formatFile} className="btn format-btn action-btn ml-3">Format</button>
            )}

            {/* Delete Button */}
            <button className="btn action-btn" onClick={(e) => {props.handleDelete(e,props.data.name)}}>
                <FontAwesomeIcon icon={faTrashAlt} size="md"/>
            </button>


            {/* Download Button */}
            {formatted && 
                <button onClick={downloadFile} className="btn action-btn">
                    <FontAwesomeIcon icon={faCloudDownloadAlt} />
                </button>
            }
        </div>
        {formatError && <p className="text-danger">Oops!! Formatting Failed. <a href="#" onClick={formatFile}>retry</a></p>}
    </div>)
}

export default File