import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const FileContext = createContext();

export const useFile = () => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error('useFile must be used within a FileProvider');
  }
  return context;
};

export const FileProvider = ({ children }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  // Upload files
  const uploadFiles = async (formData, endpoint = '/api/v1/upload') => {
    try {
      setUploading(true);
      setError(null);
      setUploadProgress(0);
      
      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
      });
      
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to upload files';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Delete file
  const deleteFile = async (fileId, endpoint = '/api/v1/files') => {
    try {
      const response = await axios.delete(`${endpoint}/${fileId}`);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete file';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Get file URL
  const getFileUrl = (filename, type = 'temp') => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    return `${baseUrl}/uploads/${type}/${filename}`;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value = {
    // State
    uploading,
    uploadProgress,
    error,
    
    // Actions
    uploadFiles,
    deleteFile,
    getFileUrl,
    formatFileSize,
    clearError
  };

  return (
    <FileContext.Provider value={value}>
      {children}
    </FileContext.Provider>
  );
};