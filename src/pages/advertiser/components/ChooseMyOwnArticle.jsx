import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { XMarkIcon, ClipboardIcon } from '@heroicons/react/24/outline';
import { useCart } from '../../../contexts/CartContext';
import { useAuth } from '../../../contexts/AuthContext';
import { orderAPI } from '../../../services/api';

const ChooseMyOwnArticle = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { itemId } = useParams();
  const { user } = useAuth();
  const { cart, updateItemArticleStatus, updateItemPaymentStatus, saveArticleData } = useCart();
  
  // Check if component is in read-only mode or edit mode
  const readOnly = location.state?.readOnly || false;
  
  const [formData, setFormData] = useState({
    articleTitle: '',
    permalinkSlug: '',
    anchorText: '',
    targetUrl: '',
    postText: '',
    metaTitle: '',
    metaKeywords: '',
    metaDescription: ''
  });
  
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState('');
  const [orderId, setOrderId] = useState(null);
  const [accountBalance, setAccountBalance] = useState(1000); // Mock account balance

  // Get the cart item from location state or find it in cart
  const cartItem = location.state?.item || cart.items?.find(item => item.id === itemId) || null;

  // Fetch projects that belong to the current advertiser
  useEffect(() => {
    if (user) {
      fetchAdvertiserProjects();
    }
  }, [user]);

  // Set form data from cart item if in view/edit mode
  useEffect(() => {
    if (cartItem) {
      if (cartItem.articleData) {
        // If article data exists in cart item, use it
        setFormData(cartItem.articleData);
        setSelectedProject(cartItem.projectId || '');
      } else if (cartItem.orderId) {
        // If there's an order ID, fetch the article data from the server
        fetchArticleData(cartItem.orderId);
        setOrderId(cartItem.orderId);
      }
      
      // Set default values for required fields if not present
      if (!formData.anchorText && cartItem.anchorText) {
        setFormData(prev => ({ ...prev, anchorText: cartItem.anchorText }));
      }
      if (!formData.targetUrl && cartItem.targetUrl) {
        setFormData(prev => ({ ...prev, targetUrl: cartItem.targetUrl }));
      }
    }
  }, [cartItem]);

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
    }
  };

  // Fetch article data from server
  const fetchArticleData = async (orderId) => {
    try {
      const response = await orderAPI.getArticleData(orderId);
      if (response.data && response.data.ok) {
        setFormData(response.data.data);
        setSelectedProject(response.data.data.projectId || '');
      }
    } catch (error) {
      console.error('Error fetching article data:', error);
      // Fallback to mock data
      const mockArticleData = {
        articleTitle: 'Sample Article Title',
        permalinkSlug: 'sample-article-title',
        anchorText: 'Sample Anchor Text',
        targetUrl: 'https://example.com',
        postText: 'This is a sample article content...',
        metaTitle: 'Sample Meta Title',
        metaKeywords: 'sample, article, keywords',
        metaDescription: 'This is a sample meta description'
      };
      
      setFormData(mockArticleData);
      setSelectedProject('1'); // Default to first project
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProjectChange = (e) => {
    setSelectedProject(e.target.value);
  };

  // Function to copy text to clipboard
  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 2000); // Reset after 2 seconds
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate required fields
      if (!formData.anchorText || !formData.targetUrl) {
        alert('Please fill in all required fields: Anchor Text and Target URL');
        setIsSubmitting(false);
        return;
      }
      
      // Save article data to server using cart context function
      // Use cartItem.orderId if available, otherwise use cartItem.id
      const itemId = cartItem.orderId || cartItem.id;
      console.log('Saving article data for item:', itemId, 'Data:', formData);
      await saveArticleData(itemId, { ...formData, projectId: selectedProject });
      
      // Update cart item status to indicate own article submission
      if (cartItem) {
        updateItemArticleStatus(cartItem.id, 'own', {
          articleData: formData,
          projectId: selectedProject,
          anchorText: formData.anchorText,
          targetUrl: formData.targetUrl
        });
        
        // Deduct from account balance (using the item's price)
        const total = cartItem.price || 0;
        if (accountBalance >= total) {
          const newBalance = accountBalance - total;
          setAccountBalance(newBalance);
          
          // Update payment status
          updateItemPaymentStatus(cartItem.id, true);
          
          // Show success message
          alert(`Your article has been saved successfully! $${total.toFixed(2)} has been deducted from your account. New balance: $${newBalance.toFixed(2)}`);
        } else {
          alert('Insufficient account balance!');
        }
      }
      
      // Navigate back to cart or to a confirmation page
      navigate('/advertiser/cart');
    } catch (error) {
      console.error('Error submitting article:', error);
      alert('There was an error saving your article. Please try again. Error: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/advertiser/cart');
  };

  if (!cartItem) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#1a1a1a] rounded-lg border border-[#bff747]/30 p-8 text-center">
            <h2 className="text-xl font-semibold text-[#bff747] mb-4">Article Not Found</h2>
            <p className="text-gray-400 mb-6">The article you're trying to edit could not be found.</p>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-[#bff747] text-[#0c0c0c] font-medium rounded-lg hover:bg-[#a8e035] transition-colors"
            >
              Back to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0c0c] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#bff747]">
            {readOnly ? 'View Article' : 'Write My Own Article'}
          </h1>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="bg-[#1a1a1a] rounded-lg border border-[#bff747]/30 p-6">
          <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <h3 className="font-medium text-blue-400 mb-1">Website: {cartItem.websiteName}</h3>
            <p className="text-sm text-blue-300">
              {readOnly 
                ? 'View your article details below.' 
                : 'Please fill in the details for your article below.'}
            </p>
          </div>

          <form onSubmit={readOnly ? undefined : handleSubmit} className="space-y-6">
            {/* Project Selection */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Select your project
                </label>
                {!readOnly && (
                  <button
                    type="button"
                    className="text-xs text-[#bff747] hover:text-[#a8e035] transition-colors"
                  >
                    + Add New Project
                  </button>
                )}
              </div>
              <div className="relative">
                <select
                  value={selectedProject}
                  onChange={handleProjectChange}
                  className="w-full px-3 py-2 bg-[#2d2d2d] border border-[#bff747]/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#bff747]"
                  disabled={readOnly}
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                {readOnly && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(projects.find(p => p.id == selectedProject)?.name, 'project')}
                    className="absolute right-2 top-2 text-[#bff747] hover:text-[#a8e035]"
                  >
                    <ClipboardIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
              {readOnly && copiedField === 'project' && (
                <div className="text-xs text-[#bff747] mt-1">Copied to clipboard!</div>
              )}
            </div>

            {/* Article Details */}
            <div className="border-b border-[#bff747]/30 pb-4">
              <h2 className="text-lg font-semibold text-[#bff747] mb-4">Article Details</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="articleTitle" className="block text-sm font-medium text-gray-300">
                      Article Title
                    </label>
                    {readOnly && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(formData.articleTitle, 'title')}
                        className="text-[#bff747] hover:text-[#a8e035]"
                      >
                        <ClipboardIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    id="articleTitle"
                    name="articleTitle"
                    value={formData.articleTitle}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-[#2d2d2d] border border-[#bff747]/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#bff747]"
                    placeholder="Enter article title"
                    required
                    readOnly={readOnly}
                  />
                  {readOnly && copiedField === 'title' && (
                    <div className="text-xs text-[#bff747] mt-1">Copied to clipboard!</div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="permalinkSlug" className="block text-sm font-medium text-gray-300">
                      Permalink Slug
                    </label>
                    {readOnly && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(formData.permalinkSlug, 'slug')}
                        className="text-[#bff747] hover:text-[#a8e035]"
                      >
                        <ClipboardIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    id="permalinkSlug"
                    name="permalinkSlug"
                    value={formData.permalinkSlug}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-[#2d2d2d] border border-[#bff747]/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#bff747]"
                    placeholder="Enter permalink slug"
                    required
                    readOnly={readOnly}
                  />
                  {readOnly && copiedField === 'slug' && (
                    <div className="text-xs text-[#bff747] mt-1">Copied to clipboard!</div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="anchorText" className="block text-sm font-medium text-gray-300">
                      Anchor Text <span className="text-red-500">*</span>
                    </label>
                    {readOnly && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(formData.anchorText, 'anchor')}
                        className="text-[#bff747] hover:text-[#a8e035]"
                      >
                        <ClipboardIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    id="anchorText"
                    name="anchorText"
                    value={formData.anchorText}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-[#2d2d2d] border border-[#bff747]/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#bff747]"
                    placeholder="Enter anchor text"
                    required
                    readOnly={readOnly}
                  />
                  {readOnly && copiedField === 'anchor' && (
                    <div className="text-xs text-[#bff747] mt-1">Copied to clipboard!</div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="targetUrl" className="block text-sm font-medium text-gray-300">
                      Target URL <span className="text-red-500">*</span>
                    </label>
                    {readOnly && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(formData.targetUrl, 'url')}
                        className="text-[#bff747] hover:text-[#a8e035]"
                      >
                        <ClipboardIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  <input
                    type="url"
                    id="targetUrl"
                    name="targetUrl"
                    value={formData.targetUrl}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-[#2d2d2d] border border-[#bff747]/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#bff747]"
                    placeholder="https://example.com"
                    required
                    readOnly={readOnly}
                  />
                  {readOnly && copiedField === 'url' && (
                    <div className="text-xs text-[#bff747] mt-1">Copied to clipboard!</div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="postText" className="block text-sm font-medium text-gray-300">
                      Post Text
                    </label>
                    {readOnly && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(formData.postText, 'post')}
                        className="text-[#bff747] hover:text-[#a8e035]"
                      >
                        <ClipboardIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  <textarea
                    id="postText"
                    name="postText"
                    value={formData.postText}
                    onChange={handleChange}
                    rows={8}
                    className="w-full px-3 py-2 bg-[#2d2d2d] border border-[#bff747]/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#bff747]"
                    placeholder="Enter your article content..."
                    required
                    readOnly={readOnly}
                  />
                  {readOnly && copiedField === 'post' && (
                    <div className="text-xs text-[#bff747] mt-1">Copied to clipboard!</div>
                  )}
                </div>
              </div>
            </div>

            {/* Meta Tags Section */}
            <div>
              <h2 className="text-lg font-semibold text-[#bff747] mb-4">Meta Tags</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-300">
                      Meta Title
                    </label>
                    {readOnly && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(formData.metaTitle, 'metaTitle')}
                        className="text-[#bff747] hover:text-[#a8e035]"
                      >
                        <ClipboardIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    id="metaTitle"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-[#2d2d2d] border border-[#bff747]/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#bff747]"
                    placeholder="Enter meta title"
                    readOnly={readOnly}
                  />
                  {readOnly && copiedField === 'metaTitle' && (
                    <div className="text-xs text-[#bff747] mt-1">Copied to clipboard!</div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="metaKeywords" className="block text-sm font-medium text-gray-300">
                      Meta Keywords
                    </label>
                    {readOnly && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(formData.metaKeywords, 'metaKeywords')}
                        className="text-[#bff747] hover:text-[#a8e035]"
                      >
                        <ClipboardIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    id="metaKeywords"
                    name="metaKeywords"
                    value={formData.metaKeywords}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-[#2d2d2d] border border-[#bff747]/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#bff747]"
                    placeholder="Enter meta keywords (comma separated)"
                    readOnly={readOnly}
                  />
                  {readOnly && copiedField === 'metaKeywords' && (
                    <div className="text-xs text-[#bff747] mt-1">Copied to clipboard!</div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-300">
                      Meta Description
                    </label>
                    {readOnly && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(formData.metaDescription, 'metaDescription')}
                        className="text-[#bff747] hover:text-[#a8e035]"
                      >
                        <ClipboardIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  <textarea
                    id="metaDescription"
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 bg-[#2d2d2d] border border-[#bff747]/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#bff747]"
                    placeholder="Enter meta description"
                    readOnly={readOnly}
                  />
                  {readOnly && copiedField === 'metaDescription' && (
                    <div className="text-xs text-[#bff747] mt-1">Copied to clipboard!</div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            {!readOnly && (
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#bff747] text-[#0c0c0c] font-medium rounded-lg hover:bg-[#a8e035] transition-colors disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Article'}
                </button>
              </div>
            )}
            
            {readOnly && (
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Back to Cart
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChooseMyOwnArticle;