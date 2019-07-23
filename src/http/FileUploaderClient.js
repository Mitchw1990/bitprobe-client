import axios from 'axios';
import FileSaver from 'file-saver';

const defaultAxiosConfig = {
    baseURL: '/api/v1/images',
    timeout: 90000,
    headers: {'Content-Type': 'multipart/form-data'},
    onUploadProgress: progressEvent => console.log(progressEvent),
    onDownloadProgress: progressEvent => console.log(progressEvent),
    transformResponse: response => {
        console.log('Response transformer...');
        return response;
    },
    transformRequest: request => {
        console.log('Request transformer...');
        return request;
    }
};

const fileClient = axios.create({
    ...defaultAxiosConfig,
    headers: {'Content-Type': 'multipart/form-data'}
});

export const readFile = file => {
    const fileReader = new FileReader();

    return new Promise((resolve, reject) => {

        fileReader.onerror = () => {
            fileReader.abort();
            reject(new Error('Problem parsing file'));
        };

        fileReader.onload = () => {
            resolve(fileReader.result);
        };

        // const f = FileSaver()


        fileReader.createObjectURL(file);
    });
};

export const downloadFileRequest = id =>
    fileClient.get(`/files/${id}`, {
        responseType: 'blob'
    });

export const uploadFileRequest = (file) => {

    const data = new FormData();
    data.append('file', file, file.name);

    return fileClient.post('/api/v1/images', data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

const fileSaver = (fileData, fileName) => FileSaver.saveAs(fileData, fileName);