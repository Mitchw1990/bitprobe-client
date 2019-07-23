import React, {useEffect, useState} from 'react';
import * as firebase from 'firebase/app';
import axios from 'axios';
import FileSaver from 'file-saver';

const {STATE_CHANGED} = firebase.storage.TaskEvent;
const rootStorageRef = firebase.storage().ref();

const FireBaseUploader = () => {

    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {

        const progress = document.getElementById('upload-progress');
        const input = document.getElementById('upload-input');

        input.addEventListener('change', ({target: {files}}) => {

            const file = files.item(0);
            const uploadTask = rootStorageRef.child(`images/${file.name}`).put(file);

            uploadTask.on(STATE_CHANGED,
                ({bytesTransferred, totalBytes, state}) => {
                    const progressPercent = (bytesTransferred / totalBytes) * 100;
                    console.log(state, progressPercent);
                    progress.value = progressPercent;
                    setUploadProgress(progressPercent);
                },
                (error) => {
                    console.error('Firebase error code:', error.code, error);
                },
                () => {
                    uploadTask.snapshot.ref.getDownloadURL().then(url => console.log('File available at', url));
                });
        });
    }, []);

    return (
        <div>
            <progress id="upload-progress" value="0" max="100"/>
            <input type="file" id="upload-input"/>
        </div>
    );
};

export default FireBaseUploader;
