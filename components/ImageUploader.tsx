
import React, { useRef, useCallback } from 'react';

interface ImageUploaderProps {
  title: string;
  onImageUpload: (file: File) => void;
  imagePreviewUrl: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ title, onImageUpload, imagePreviewUrl }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onImageUpload(event.target.files[0]);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      onImageUpload(event.dataTransfer.files[0]);
    }
  }, [onImageUpload]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-2 text-center text-slate-300">{title}</h2>
      <div
        className="relative w-full h-80 bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-lg flex justify-center items-center cursor-pointer hover:border-purple-500 transition-colors duration-300 overflow-hidden group"
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          type="file"
          ref={inputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
        />
        {imagePreviewUrl ? (
          <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center text-slate-500">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            <p className="font-semibold">Click or drag image here</p>
            <p className="text-sm">PNG, JPG, or WEBP</p>
          </div>
        )}
        <div className="absolute inset-0 bg-black/50 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <p className="text-lg font-bold">{imagePreviewUrl ? 'Change Image' : 'Upload Image'}</p>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
