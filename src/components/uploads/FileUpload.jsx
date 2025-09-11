import React, { useState, useRef } from 'react';
import { 
  PhotoIcon, 
  DocumentIcon, 
  XMarkIcon, 
  ArrowUpTrayIcon,
  EyeIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const FileUpload = ({ 
  onUpload, 
  maxFiles = 5, 
  maxSize = 10 * 1024 * 1024, // 10MB
  accept = 'image/*,.pdf,.doc,.docx,.txt',
  multiple = true,
  label = 'Upload Files',
  showPreview = true
}) => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    // Check file size
    if (file.size > maxSize) {
      return `File ${file.name} is too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`;
    }
    
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    const acceptedTypes = accept.split(',').map(type => type.trim());
    
    const isAccepted = acceptedTypes.some(type => {
      if (type.startsWith('image/')) {
        return file.type.startsWith('image/');
      }
      if (type.startsWith('.')) {
        return fileExtension === type.toLowerCase();
      }
      return false;
    });
    
    if (!isAccepted) {
      return `File type not allowed for ${file.name}.`;
    }
    
    return null;
  };

  const handleFiles = (fileList) => {
    setError('');
    
    const newFiles = Array.from(fileList);
    const validFiles = [];
    let errorMessage = '';
    
    // Validate files
    for (const file of newFiles) {
      const validationError = validateFile(file);
      if (validationError) {
        errorMessage = validationError;
        break;
      }
      
      // Check if we exceed max files
      if (files.length + validFiles.length >= maxFiles) {
        errorMessage = `Maximum ${maxFiles} files allowed.`;
        break;
      }
      
      validFiles.push(file);
    }
    
    if (errorMessage) {
      setError(errorMessage);
      return;
    }
    
    // Create preview URLs
    const filesWithPreview = validFiles.map(file => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    
    setFiles(prev => [...prev, ...filesWithPreview]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index) => {
    const fileToRemove = files[index];
    
    // Revoke preview URL if it exists
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one file to upload.');
      return;
    }
    
    const formData = new FormData();
    
    files.forEach((fileObj, index) => {
      formData.append(`file${index}`, fileObj.file);
    });
    
    try {
      if (onUpload) {
        await onUpload(formData, files);
        // Clear files after successful upload
        files.forEach(fileObj => {
          if (fileObj.preview) {
            URL.revokeObjectURL(fileObj.preview);
          }
        });
        setFiles([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to upload files.');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return <PhotoIcon className="h-8 w-8 text-blue-500" />;
    }
    return <DocumentIcon className="h-8 w-8 text-gray-500" />;
  };

  return (
    <div className="space-y-4">
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileInput}
          accept={accept}
          multiple={multiple}
        />
        
        <div className="flex flex-col items-center justify-center">
          <ArrowUpTrayIcon className="h-12 w-12 text-gray-400 mb-3" />
          <p className="text-lg font-medium text-gray-900 mb-1">{label}</p>
          <p className="text-sm text-gray-500">
            Drag and drop files here or click to browse
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Max file size: {maxSize / (1024 * 1024)}MB
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XMarkIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {showPreview && files.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Selected Files</h3>
          <div className="space-y-3">
            {files.map((fileObj, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  {fileObj.preview ? (
                    <img 
                      src={fileObj.preview} 
                      alt={fileObj.name} 
                      className="h-12 w-12 object-cover rounded mr-3"
                    />
                  ) : (
                    <div className="mr-3">
                      {getFileIcon(fileObj.type)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                      {fileObj.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(fileObj.size)}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={() => removeFile(index)}
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleUpload}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Upload Files
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;