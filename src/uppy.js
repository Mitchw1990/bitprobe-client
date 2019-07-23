import Uppy from '@uppy/core'
import Webcam from '@uppy/webcam'
import Dashboard from '@uppy/dashboard'
import XHRUpload from '@uppy/xhr-upload'

const uppy = () => Uppy({
    debug: true,
    autoProceed: false,
    restrictions: {
        maxFileSize: null,
        maxNumberOfFiles: 10,
        minNumberOfFiles:  null,
        allowedFileTypes: ['image/*']
    }
})
    .use(Dashboard, {
        trigger: '.UppyModalOpenerBtn',
        inline: true,
        target: '.DashboardContainer',
        replaceTargetContent: true,
        showProgressDetails: true,
        note: 'Upload yo images...',
        height: 470,
        metaFields: [
            {id: 'name', name: 'Name', placeholder: 'file name'},
            {id: 'caption', name: 'Caption', placeholder: 'describe what the image is about'}
        ],
        browserBackButtonClose: true
    }).use(XHRUpload, {
        endpoint: 'https://phstore-api-jvyjoazqra-uc.a.run.app/api/v1/upload',
        formData: true,
        fieldName: 'image',
        headers: {'Transfer-Encoding': 'chunked'}
    })
    .use(Webcam, {target: Dashboard})
    .on('complete', result => {
        console.log('successful files:', result.successful)
        console.log('failed files:', result.failed)
    })

export default uppy