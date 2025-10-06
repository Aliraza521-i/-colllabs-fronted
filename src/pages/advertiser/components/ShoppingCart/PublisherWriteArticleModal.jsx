import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../../contexts/AuthContext';
import { useCart } from '../../../../contexts/CartContext';

const PublisherWriteArticleModal = ({ isOpen, onClose, item, onSubmit }) => {
  const { user } = useAuth();
  const { updateItemArticleStatus, saveArticleData } = useCart();
  const [formData, setFormData] = useState({
    project: '',
    anchorText: item?.anchorText || '',
    targetUrl: item?.targetUrl || '',
    articleRequirements: ''
  });
  const [projects, setProjects] = useState([]);

  // Fetch projects that belong to the current advertiser
  useEffect(() => {
    if (isOpen && user) {
      fetchAdvertiserProjects();
    }
  }, [isOpen, user]);

  const fetchAdvertiserProjects = async () => {
    try {
      // In a real app, this would be an API call to fetch projects for the current advertiser
      // Example: const response = await api.get(`/advertisers/${user.id}/projects`);
      
      // Mock data - replace with actual API call
      const mockProjects = [
        { id: 1, name: 'Tech Blog Project', advertiserId: user?.id },
        { id: 2, name: 'Marketing Campaign', advertiserId: user?.id },
        { id: 3, name: 'Product Review Site', advertiserId: user?.id }
      ];
      
      setProjects(mockProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      // Handle error appropriately
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Save article data to server
      // Use item.orderId if available, otherwise use item.id
      const itemId = item.orderId || item.id;
      console.log('Saving article data for item:', itemId, 'Data:', formData);
      await saveArticleData(itemId, { ...formData });
      
      // Update cart item status with copywriting price
      updateItemArticleStatus(item.id, 'publisher', {
        anchorText: formData.anchorText,
        targetUrl: formData.targetUrl,
        articleRequirements: formData.articleRequirements,
        projectId: formData.project
      });
      
      onSubmit({ ...formData, item });
      onClose();
    } catch (error) {
      console.error('Error saving article data:', error);
      alert('There was an error saving your article data. Please try again. Error: ' + error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] rounded-lg border border-[#bff747]/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="border-b border-[#bff747]/30 p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-[#bff747]">Want Publisher to Write Article</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Website: <span className="text-white">{item?.websiteName}</span>
            </label>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="project" className="block text-sm font-medium text-gray-300">
                Project
              </label>
              <button
                type="button"
                className="text-xs text-[#bff747] hover:text-[#a8e035] transition-colors"
              >
                + Add New Project
              </button>
            </div>
            <select
              id="project"
              name="project"
              value={formData.project}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-[#2d2d2d] border border-[#bff747]/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#bff747]"
              required
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="anchorText" className="block text-sm font-medium text-gray-300 mb-2">
              Anchor Text
            </label>
            <input
              type="text"
              id="anchorText"
              name="anchorText"
              value={formData.anchorText}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-[#2d2d2d] border border-[#bff747]/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#bff747]"
              placeholder="Enter anchor text"
              required
            />
          </div>
          
          <div>
            <label htmlFor="targetUrl" className="block text-sm font-medium text-gray-300 mb-2">
              Target URL
            </label>
            <input
              type="url"
              id="targetUrl"
              name="targetUrl"
              value={formData.targetUrl}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-[#2d2d2d] border border-[#bff747]/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#bff747]"
              placeholder="https://example.com"
              required
            />
          </div>
          
          <div>
            <label htmlFor="articleRequirements" className="block text-sm font-medium text-gray-300 mb-2">
              Article Requirements
            </label>
            <textarea
              id="articleRequirements"
              name="articleRequirements"
              value={formData.articleRequirements}
              onChange={handleChange}
              rows={5}
              className="w-full px-3 py-2 bg-[#2d2d2d] border border-[#bff747]/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#bff747]"
              placeholder="Describe your article requirements..."
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#bff747] text-[#0c0c0c] font-medium rounded-md hover:bg-[#a8e035] transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublisherWriteArticleModal;