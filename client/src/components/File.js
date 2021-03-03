/* eslint-disable react/prop-types */
import React, {useRef, useState} from 'react';
import '../styles/components/File.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCloudDownloadAlt, faSpinner, faTrashAlt, faWrench } from '@fortawesome/free-solid-svg-icons'

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
    const [convertedFileName, setConvertedFileName] = useState(null);
    const FileRef = useRef();

    //download formatted file by opening a new windows
    // couldnt use fetch to download when using res.download on the server
    const downloadFile = () => {
        const desiredName = props.data.name.substring(0, props.data.name.lastIndexOf('.')) + '.txt';

        window.open(`/download?desiredName=${desiredName}&filename=${convertedFileName}`);
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
        }).then(({convertedFileName}) => {
            if(convertedFileName){
                setConvertedFileName(convertedFileName);
                setFormatted(true);
                setFormatting(false);
            }else{
                //Note: dont throw error inside a then function, let Promises do their work
                throw Error('Format Error, Server Didnt convert file');
            }
        }).catch(e => {
            console.log(e);
            setFormatError(true);
        });
    }

    return (
    <div className="File row mb-3 pb-1" ref={FileRef}>
        <div className="filename-wrapper mr-4 lead align-text-bottom ml-2">
            {props.data.name}
            <small> - <b>{formatFileSize(props.data.size)}</b></small>
        </div>

        <div className="filetools-wrapper d-xs-block mt-xs-2">

            {/* TextBoxes */}
            {!formatting && !formatted && (
            <>
                <input type="number" min={10} max={500} defaultValue={100} className="groupBy"/>
                <input type="number" min={5} max={100} defaultValue={10} className="countPerLine action"/>
            </>
            )}

            {/* Formatting Spinner */}
            {formatting && !formatError && (
                <span className="action">
                    Formatting
                    <FontAwesomeIcon icon={faSpinner} spin/>
                </span>)
            }

            {/* Format Button */}
            {!formatting && !formatted && (
                <button onClick={formatFile} className="btn action">
                    <FontAwesomeIcon icon={faWrench} size="md"/> Format
                </button>
            )}

            {/* Delete Button */}
            <button className="btn action" onClick={(e) => {props.handleDelete(e,props.data.name)}}>
                <FontAwesomeIcon icon={faTrashAlt} size="md"/> Remove
            </button>


            {/* Download Button */}
            {formatted && convertedFileName && 
                <button onClick={downloadFile} className="btn action">
                    <FontAwesomeIcon icon={faCloudDownloadAlt} /> Download
                </button>
            }
              
        </div>
        {formatError && <p className="text-danger ml-3">Oops!! Formatting Failed. <p className="text-primary retry-btn" onClick={formatFile}>retry</p></p>}
    </div>)
}

export default File