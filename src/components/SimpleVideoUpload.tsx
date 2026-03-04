import React, { useState } from 'react';

// Simple Video Upload Component - Learning Version
const SimpleVideoUpload = () => {
  // Step 1: Create state to track our files
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  // Step 2: Handle file selection (when user clicks "Choose Files")
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    processFiles(files);
  };

  // Step 3: Handle drag and drop
  const handleDrop = (event) => {
    event.preventDefault(); // Prevent browser from opening the file
    setIsDragging(false);
    
    const files = Array.from(event.dataTransfer.files);
    processFiles(files);
  };

  const handleDragOver = (event) => {
    event.preventDefault(); // This is required for drop to work
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Step 4: Process and validate files
  const processFiles = (files) => {
    const videoFiles = files.filter(file => {
      // Check if it's a video file
      return file.type.startsWith('video/');
    });

    // Add files to our state
    const newFiles = videoFiles.map((file, index) => ({
      id: Date.now() + index, // Simple ID
      name: file.name,
      size: file.size,
      file: file // Store the actual file object
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  // Step 5: Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
    return Math.round(bytes / 1048576) + ' MB';
  };

  // Step 6: Remove files
  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* The Drop Zone */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          hover:border-blue-400 transition-colors
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="space-y-4">
          <div className="text-gray-600">
            <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          <div>
            <p className="text-lg font-medium">Drop video files here</p>
            <p className="text-gray-500">or click to browse</p>
          </div>

          {/* Hidden file input */}
          <input
            type="file"
            accept="video/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          
          <label 
            htmlFor="file-upload" 
            className="inline-block px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600"
          >
            Choose Files
          </label>
        </div>
      </div>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6 space-y-2">
          <h3 className="font-medium">Uploaded Files:</h3>
          {uploadedFiles.map(file => (
            <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
              </div>
              <button 
                onClick={() => removeFile(file.id)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimpleVideoUpload;