
import React, { useState, useRef } from "react";
import "../styles/theme.css";

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

const FileUpload = ({ 
  accept = "*/*", 
  multiple = false, 
  label, 
  required = false, 
  onChange,
  fileType,
  fileTypeLabel
}) => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles.map(file => ({
      file,
      id: Date.now() + Math.random().toString(36).substring(2, 9),
      progress: 100,
      uploading: false
    }))]);
    
    if (onChange) {
      onChange(selectedFiles);
    }
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles.map(file => ({
      file,
      id: Date.now() + Math.random().toString(36).substring(2, 9),
      progress: 100,
      uploading: false
    }))]);
    
    if (onChange) {
      onChange(droppedFiles);
    }
  };
  
  const removeFile = (id) => {
    setFiles(files.filter(file => file.id !== id));
  };
  
  const openFileDialog = () => {
    fileInputRef.current.click();
  };
  
  return (
    <div className="form-full-width">
      <label className="form-label">
        {label}
        {fileTypeLabel && (
          <span className={`file-type-tag ${required ? 'file-type-required' : 'file-type-optional'}`}>
            {fileTypeLabel}
          </span>
        )}
      </label>
      
      <div 
        className={`file-upload-container ${isDragging ? 'border-accent' : ''}`}
        onClick={openFileDialog}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="mt-2 text-base font-semibold text-white">
          {isDragging ? 'Drop files here' : 'Drag and drop files here'}
        </p>
        <p className="file-upload-text">or click to select files</p>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          required={required && files.length === 0}
          onChange={handleFileChange}
          className="file-upload-input"
          data-file-type={fileType}
        />
      </div>
      
      {files.length > 0 && (
        <div className="attachments-container">
          {files.map((fileObj) => (
            <div key={fileObj.id} className="attachment-item">
              <div className="attachment-icon">
                <i className="fas fa-file-alt"></i>
              </div>
              <div className="attachment-details">
                <div className="attachment-name">{fileObj.file.name}</div>
                <div className="attachment-meta">
                  <span className="attachment-size">{formatBytes(fileObj.file.size)}</span>
                  {fileObj.uploading && <span className="attachment-status">Uploading...</span>}
                </div>
                {fileObj.uploading && (
                  <div className="attachment-progress">
                    <div 
                      className="attachment-progress-bar" 
                      style={{ width: `${fileObj.progress}%` }}
                    ></div>
                  </div>
                )}
              </div>
              <div className="attachment-actions">
                <button 
                  type="button"
                  className="attachment-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(fileObj.id);
                  }}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;