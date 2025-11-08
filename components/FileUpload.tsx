import React, { useState, useCallback, useRef } from 'react';
import type { AppStatus } from '../types';

interface FileUploadProps {
  onFileChange: (files: FileList | null) => void;
  files: File[];
  status: AppStatus;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileChange, files, status }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileChange(e.dataTransfer.files);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileChange(e.target.files);
  };

  const triggerFileSelect = () => {
    inputRef.current?.click();
  }

  const baseClasses = "flex justify-center items-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ease-in-out";
  const inactiveClasses = "border-gray-300 bg-gray-50 hover:bg-gray-100";
  const activeClasses = "border-blue-500 bg-blue-50";

  return (
    <div className="space-y-4">
      <label
        htmlFor="file-upload"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={triggerFileSelect}
        className={`${baseClasses} ${isDragging ? activeClasses : inactiveClasses}`}
      >
        <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          <p className="mt-2 text-sm text-gray-600">
            <span className="font-semibold text-blue-600">Clique para enviar</span> ou arraste e solte
          </p>
          <p className="text-xs text-gray-500">Apenas arquivos CSV</p>
        </div>
        <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept=".csv" onChange={handleInputChange} ref={inputRef} />
      </label>

      {files.length > 0 && (
        <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Arquivos Selecionados:</h3>
            <ul className="max-h-36 overflow-y-auto rounded-md border border-gray-200 bg-white divide-y divide-gray-200">
                {files.map((file, index) => (
                    <li key={index} className="px-3 py-2 text-sm text-gray-600 truncate">
                        {file.name}
                    </li>
                ))}
            </ul>
        </div>
      )}
    </div>
  );
};