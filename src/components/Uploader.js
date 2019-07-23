import React, {useEffect, useState} from 'react';
import {useAsyncFn} from 'react-use';
import {uploadFileRequest} from '../http/FileUploaderClient';

const Uploader = () => {

    const [uploadProgress, setUploadProgress] = useState([]);
    const [files, fileUploadHandler] = useAsyncFn(async () => uploadFileRequest(files), []);

    useEffect(() => {

        const formData = new FormData(document.getElementById('upload-input'));

        fetch('http://localhost:5001/', {
            method: 'POST',
            body: formData,
            mode: 'no-cors'
        })
            .then(result => console.log(result))
            .catch(error => console.error(error));


        const input = document.getElementById('upload-input');
        input.addEventListener('change', ({target: {files}}) => {

            fileUploadHandler(files.item(0))
                .then( response => setUploadProgress(uploadProgress.concat(response.data)))
                .catch(error => console.log('Error'))
        });

        return () => input.removeEventListener('change', event => console.log('Removed upload event handler.'))

    },[]);

    return (
        <div>
            <progress id="upload-progress" value="0" max="100"/>
            <input type="file" id="upload-input"/>
        </div>
    );
};

export default Uploader;


const upload = () => {

    const data = new FormData();
    data.append('file1', '/Users/mitch/TEST_PHOTOS/images/vehicles/8163804713_c44fb78581_o.jpg');
    data.append('type', 'image/jpeg');

    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener('readystatechange', function () {
        if (this.readyState === 4) {
            console.log(this.responseText);
        }
    });

    xhr.open('POST', 'https://firebasestorage.googleapis.com/v0/b/bitprobe-mw.appspot.com/o/image1');
    xhr.setRequestHeader('Content-Type', 'application/octet-stream');
    xhr.setRequestHeader('User-Agent', 'PostmanRuntime/7.15.2');
    xhr.setRequestHeader('Accept', '*/*');
    xhr.setRequestHeader('Cache-Control', 'no-cache');
    xhr.setRequestHeader('Postman-Token', '7a7cca43-0a1a-4827-9ff9-d6825df51111,78f7545e-31e1-40b2-b42d-a73956657421');
    xhr.setRequestHeader('Host', 'firebasestorage.googleapis.com');
    xhr.setRequestHeader('Accept-Encoding', 'gzip, deflate');
    xhr.setRequestHeader('Content-Length', '6403818');
    xhr.setRequestHeader('Connection', 'keep-alive');
    xhr.setRequestHeader('cache-control', 'no-cache');

    xhr.send(data);
};




