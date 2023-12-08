import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useDropzone } from 'react-dropzone';

export function Button({ onClick, className, children }) {
    return (
        <button
            className={`flex-none shadow-md hover:shadow-lg transition-all px-4 py-2 rounded-sm text-white bg-green-500 hover:bg-green-400 active:bg-green-600 active:shadow-none ${className}`}
            onClick={onClick}
        >{children}</button>
    );
}


/*
const baseStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    borderWidth: 2,
    borderRadius: 2,
    borderColor: '#eeeeee',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    color: '#bdbdbd',
    transition: 'border .3s ease-in-out'
};

const activeStyle = {
    borderColor: '#2196f3'
};

const acceptStyle = {
    borderColor: '#00e676'
};

const rejectStyle = {
    borderColor: '#ff1744'
};

export function Dropzone() {
    const [files, setFiles] = useState([]);

    const onDrop = useCallback(acceptedFiles => {
        setFiles(acceptedFiles.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file)
        })));
        console.log(acceptedFiles);
    }, []);

    const {
        getRootProps,
        getInputProps,
        isDragActive,
        isDragAccept,
        isDragReject
    } = useDropzone({
        onDrop,
        accept: 'image/jpeg, image/png, video/mp4'
    });

    const style = useMemo(() => ({
        ...baseStyle,
        ...(isDragActive ? activeStyle : {}),
        ...(isDragAccept ? acceptStyle : {}),
        ...(isDragReject ? rejectStyle : {})
    }), [
        isDragActive,
        isDragReject,
        isDragAccept
        ]
    );

    const thumbs = files.map(file => (
        <div key={file.name}>
            <img
                src={file.preview}
                alt={file.name}
            />
        </div>
    ));

    // clean up
    useEffect(() => () => {
        files.forEach(file => URL.revokeObjectURL(file.preview));
    }, [files]);

    return (
    <section>
        <div {...getRootProps()}>
            <input {...getInputProps()} />
            <div>Drag and drop your images here.</div>
        </div>
        <aside>
            {thumbs}
        </aside>
    </section>
    );
}
*/
