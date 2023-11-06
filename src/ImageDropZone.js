
import React, { useState } from 'react';

const ImageDropZone = (props) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [imageName, setImageName] = useState('');

    const onDrop = (e) => {
        e.preventDefault();

        if (e.dataTransfer.items) {
            for (let i = 0; i < e.dataTransfer.items.length; i++) {
                if (e.dataTransfer.items[i].kind === 'file') {
                    const file = e.dataTransfer.items[i].getAsFile();
                    const fileURL = URL.createObjectURL(file);

                    setImageSrc(fileURL);
                    setImageName(file.name);
                }
            }
        }
    };

    const onDragOver = (e) => {
        e.preventDefault();
    };

    const removeImage = () => {
        setImageSrc(null);
        setImageName('');
    };

    return (
        <div
            className="dropzone"
            onDrop={onDrop}
            onDragOver={onDragOver}
            style={{ border: '2px dashed gray', height: 200, position: 'relative' }}>

            {imageSrc ? (
                <>
                    <img
                        src={imageSrc}
                        alt="Dropped"
                        style={{ maxWidth: '100%', maxHeight: '100%' }} />
                    <p>{imageName}</p>
                    <button
                        onClick={removeImage}
                        style={{ position: 'absolute', right: 10, top: 10 }}>
                        Remove
                    </button>
                </>
            ) : (
                <p>Drag & Drop your image here</p>
            )}
        </div>
    );
}

export default ImageDropZone;
