import {ORIENTATIONS} from './orientation-constants';
import {createCanvas, isObjectURL, isPreviewSupported, resizeIfTooBigForCanvas} from './legacy-browser';

const Exif = require('exif-js');

class Uppy {

    state = {
        files: {
            1: {
                preview: 'objectURL'
            }
        }
    };

    log = console.log;

    getState() {
        return this.state;
    }

    getFile(fileID) {
        return this.state.files[fileID];
    }

    emit(message, fileID, value) {
        console.log({
            log: 'emitting',
            message,
            fileID,
            value
        });
    }


    setFileState(fileID, fileData = {preview: ''}) {
        this.state.files = {
            ...this.state.files,
            [fileID]: {
                ...fileData
            }
        };
    }
}

const opts = {};

module.exports = class ThumbnailGenerator {

    constructor(uppy, opts) {
        this.uppy = uppy;
        this.type = 'thumbnail';
        this.id = this.opts.id || 'ThumbnailGenerator';
        this.title = 'Thumbnail Generator';
        this.queue = [];
        this.queueProcessing = false;
        this.defaultThumbnailDimension = 200;

        const defaultOptions = {
            thumbnailWidth: null,
            thumbnailHeight: null
        };

        this.opts = {
            ...defaultOptions,
            ...opts
        };

        this.addFile = this.addFile.bind(this);
        this.removeFile = this.removeFile.bind(this);
    }

    addFile(file) {
        if (!file.preview) {
            this.queue.push(file);
            !this.queueProcessing && this.processQueue();
        }
    }

    removeFile(file) {
        const index = this.queue.indexOf(file);
        if (index !== -1) {
            this.queue.splice(index, 1);
        }

        if (file.preview && isObjectURL(file.preview)) {
            URL.revokeObjectURL(file.preview);
        }
    }

    createThumbnail(file, targetWidth, targetHeight) {

        const originalUrl = URL.createObjectURL(file.data);

        const onload = new Promise((resolve, reject) => {
            const image = new Image();
            image.src = originalUrl;
            image.addEventListener('load', () => {
                URL.revokeObjectURL(originalUrl);
                resolve(image);
            });
            image.addEventListener('error', (event) => {
                URL.revokeObjectURL(originalUrl);
                reject(event.error || new Error('Could not create thumbnail'));
            });
        });

        return Promise.all([onload, this.getOrientation(file)])
            .then(values => {
                const image = values[0];
                const orientation = values[1];
                const dimensions = this.getProportionalDimensions(image, targetWidth, targetHeight, orientation.rotation);

                //can possibly use this full-sized rotated image
                //if rotated, the image is technically altered.
                const rotatedImage = this.rotateImage(image, orientation);
                const resizedImage = this.resizeImage(rotatedImage, dimensions.width, dimensions.height);
                return this.canvasToBlob(resizedImage, 'image/png');
            })
            .then(blob => {
                return URL.createObjectURL(blob);
            });
    }

    /**
     * Get the new calculated dimensions for the given image and a target width
     * or height. If both width and height are given, only width is taken into
     * account. If neither width nor height are given, the default dimension
     * is used.
     */
    getProportionalDimensions(img, width, height, rotation) {

        let aspect = img.width / img.height;

        if (rotation === 90 || rotation === 270) {
            aspect = img.height / img.width;
        }

        if (width != null) {
            return {
                width: width,
                height: Math.round(width / aspect)
            };
        }

        if (height != null) {
            return {
                width: Math.round(height * aspect),
                height: height
            };
        }

        return {
            width: this.defaultThumbnailDimension,
            height: Math.round(this.defaultThumbnailDimension / aspect)
        };
    }

    getOrientation(file) {
        return new Promise((resolve) => {
            Exif.getData(file.data, function callback() {
                const orientation = Exif.getTag(this, 'Orientation') || 1;
                resolve(ORIENTATIONS[orientation]);
            });
        });
    }

    resizeImage(image, targetWidth, targetHeight) {

        image = resizeIfTooBigForCanvas(image);

        //polyfill for IE not supporting Math.log2
        let steps = Math.ceil(Math.log(image.width / targetWidth) * Math.LOG2E);

        if (steps < 1) {
            steps = 1;
        }

        let width = targetWidth * Math.pow(2, steps - 1);
        let height = targetHeight * Math.pow(2, steps - 1);

        while (steps--) {

            let canvas = createCanvas(width, height);
            canvas.getContext('2d').drawImage(image, 0, 0, width, height);
            image = canvas;

            width = Math.round(width / 2);
            height = Math.round(height / 2);
        }

        return image;
    }

    setPreviewURL(fileID, preview) {
        this.uppy.setFileState(fileID, {preview});
    }

    processQueue() {
        this.queueProcessing = true;
        if (this.queue.length) {

            return this.requestThumbnail(this.queue.shift())
                .catch(() => console.info('No more images in the queue.'))
                .then(this.processQueue);
        }

        this.queueProcessing = false;
        this.uppy.log('[ThumbnailGenerator] Emptied thumbnail queue');
        this.uppy.emit('thumbnail:all-generated');
    }

    requestThumbnail(file) {
        if (isPreviewSupported(file.type) && !file.isRemote) {
            return this.createThumbnail(file, this.opts.thumbnailWidth, this.opts.thumbnailHeight)
                .then(preview => {
                    this.setPreviewURL(file.id, preview);
                    this.uppy.log(`[ThumbnailGenerator] Generated thumbnail for ${file.id}`);
                    this.uppy.emit('thumbnail:generated', this.uppy.getFile(file.id), preview);
                })
                .catch(err => {
                    this.uppy.log(`[ThumbnailGenerator] Failed thumbnail for ${file.id}:`, 'warning');
                    this.uppy.log(err, 'warning');
                    this.uppy.emit('thumbnail:error', this.uppy.getFile(file.id), err);
                });
        }
        return Promise.resolve();
    }
};