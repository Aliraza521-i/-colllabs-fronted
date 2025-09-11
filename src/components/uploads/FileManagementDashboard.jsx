import React, { useState, useEffect } from 'react';
import { useFile } from '../../contexts/FileContext';
import FileUpload from './FileUpload';
import { 
  DocumentIcon, 
  PhotoIcon, 
  DocumentTextIcon, 
  TrashIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const FileManagementDashboard = () => {
  const { uploading, uploadProgress, error, uploadFiles, deleteFile, getFileUrl, formatFileSize, clearError } = useFile();
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');

  // Mock file data - in a real app, this would come from an API
  const mockFiles = [
    {
      id: '1',
      name: 'website-screenshot.png',
      type: 'image/png',
      size: 245760,
      uploadedAt: new Date('2023-06-15'),
      url: '/uploads/images/website-screenshot.png'
    },
    {
      id: '2',
      name: 'content-guidelines.pdf',
      type: 'application/pdf',
      size: 1048576,
      uploadedAt: new Date('2023-06-10'),
      url: '/uploads/documents/content-guidelines.pdf'
    },
    {
      id: '3',
      name: 'blog-post.docx',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 524288,
      uploadedAt: new Date('2023-06-05'),
      url: '/uploads/content/blog-post.docx'
    },
    {
      id: '4',
      name: 'verification-document.jpg',
      type: 'image/jpeg',
      size: 180224,
      uploadedAt: new Date('2023-06-01'),
      url: '/uploads/verification/verification-document.jpg'
    }
  ];

  useEffect(() => {
    setFiles(mockFiles);
  }, []);

  const handleUpload = async (formData) => {
    try {
      // In a real app, you would call the API:
      // const response = await uploadFiles(formData);
      
      // For demo purposes, we'll just add the files to state
      alert('Files uploaded successfully!');
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleDelete = async (fileId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        // In a real app, you would call the API:
        // await deleteFile(fileId);
        
        // For demo purposes, we'll just remove from state
        setFiles(prev => prev.filter(file => file.id !== fileId));
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return <PhotoIcon className="h-6 w-6 text-blue-500" />;
    }
    if (fileType === 'application/pdf') {
      return <DocumentTextIcon className="h-6 w-6 text-red-500" />;
    }
    return <DocumentIcon className="h-6 w-6 text-gray-500" />;
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = fileTypeFilter === 'all' || 
      (fileTypeFilter === 'images' && file.type.startsWith('image/')) ||
      (fileTypeFilter === 'documents' && !file.type.startsWith('image/'));
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">File Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload, manage, and organize your files
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
                <button
                  onClick={clearError}
                  className="ml-3 text-sm font-medium text-red-700 hover:text-red-600"
                >
                  Dismiss
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Files</h2>
        <FileUpload 
          onUpload={handleUpload}
          maxFiles={10}
          maxSize={10 * 1024 * 1024}
          accept="image/*,.pdf,.doc,.docx,.txt"
          multiple={true}
          label="Drag and drop files here or click to browse"
        />
        
        {uploading && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* File Management */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <h2 className="text-lg font-medium text-gray-900">Your Files</h2>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <select
                value={fileTypeFilter}
                onChange={(e) => setFileTypeFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="all">All Files</option>
                <option value="images">Images</option>
                <option value="documents">Documents</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No files found
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                          {getFileIcon(file.type)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{file.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {file.type.split('/')[1] || file.type}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFileSize(file.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {file.uploadedAt.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <a
                          href={getFileUrl(file.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </a>
                        <a
                          href={getFileUrl(file.url)}
                          download
                          className="text-green-600 hover:text-green-900"
                        >
                          <ArrowDownTrayIcon className="h-5 w-5" />
                        </a>
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FileManagementDashboard;