export const canvasToBlobForOldBrowsers = (canvas, resolve, type, quality) => {

    Promise.resolve()
        .then(() => dataURItoBlob(canvas.toDataURL(type, quality), {}))
        .then(blob => blob || throw new Error('could not extract blob, probably an old browser'));
};


export const dataURItoBlob = (dataURI, opts, toFile) => {

    // get the base64 data
    const data = dataURI.split(',')[1];

    // user may provide mime type, if not get it from data URI
    let mimeType = opts.mimeType || dataURI.split(',')[0].split(':')[1].split(';')[0];

    // default to plain/text if data URI has no mimeType
    if (mimeType == null) {
        mimeType = 'plain/text';
    }

    const binary = atob(data);
    const array = [];
    for (let i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }

    let bytes;
    try {
        bytes = new Uint8Array(array); // eslint-disable-line compat/compat
    } catch (err) {
        return null;
    }

    // Convert to a File?
    if (toFile) {
        return new File([bytes], opts.name || '', {type: mimeType});
    }

    return new Blob([bytes], {type: mimeType});
};


// For ios with 256 RAM and ie
// Make sure the image doesn't exceed browser/device canvas limits.
export const resizeIfTooBigForCanvas = (image) => {

    const maxSquare = 5000000; // ios max canvas square
    const maxSize = 4096; // ie max canvas dimensions
    const ratio = image.width / image.height;
    let maxW = Math.floor(Math.sqrt(maxSquare * ratio));
    let maxH = Math.floor(maxSquare / Math.sqrt(maxSquare * ratio));

    if (maxW > maxSize) {
        maxW = maxSize;
        maxH = Math.round(maxW / ratio);
    }
    if (maxH > maxSize) {
        maxH = maxSize;
        maxW = Math.round(ratio * maxH);
    }
    if (image.width > maxW) {
        const canvas = document.createElement('canvas');
        canvas.width = maxW;
        canvas.height = maxH;
        canvas.getContext('2d').drawImage(image, 0, 0, maxW, maxH);
        image = canvas;
    }

    return image;
};

export const rotateImage = (image, exifOrientation) => {

    const isLandscape = exifOrientation.rotation === 90 || exifOrientation.rotation === 270;

    const width = isLandscape ? image.height : image.width;
    const height = isLandscape ? image.width : image.height;

    const canvas = createCanvas(width, height);

    const context = canvas.getContext('2d');
    context.translate(width / 2, height / 2);
    context.rotate(exifOrientation.rotation * Math.PI / 180);
    context.scale(exifOrientation.xScale, exifOrientation.yScale);
    context.drawImage(image, -image.width / 2, -image.height / 2, image.width, image.height);

    return canvas;
};

export const canvasToBlob = (canvas, type, quality) => {
    try {
        canvas.getContext('2d').getImageData(0, 0, 1, 1);
    } catch (err) {
        if (err.code === 18) {
            return Promise.reject(new Error('cannot read image, probably an svg with external resources'));
        }
    }

    return new Promise(resolve => {
        canvas.toBlob(resolve, type, quality);
    }).then((blob) => {
        if (blob === null) {
            throw new Error('cannot read image, probably an svg with external resources');
        }
        return blob;
    });
};

export const createCanvas = (width, height) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
};


export const isPreviewSupported = (fileType) => {
    if (!fileType) return false;
    // list of images that browsers can preview
    return /^(jpe?g|gif|png|svg|svg\+xml|bmp)$/.test(fileType.split('/')[1]);
};

export const isObjectURL = (url) => {
    return url.indexOf('blob:') === 0;
};
