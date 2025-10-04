import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { XMarkIcon, ClipboardIcon } from '@heroicons/react/24/outline';
import { orderAPI } from '../../../services/api';

const Article = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get article data from location state or use default values
  const articleDataFromState = location.state?.articleData || null;
  const orderId = location.state?.orderId || null;
  
  const [articleData, setArticleData] = useState({
    articleTitle: '',
    permalinkSlug: '',
    anchorText: '',
    targetUrl: '',
    postText: '',
    metaTitle: '',
    metaKeywords: '',
    metaDescription: ''
  });
  
  const [projects, setProjects] = useState([
    { id: 1, name: 'Tech Blog Project' },
    { id: 2, name: 'Marketing Campaign' },
    { id: 3, name: 'Product Review Site' }
  ]);
  
  const [selectedProject, setSelectedProject] = useState('');
  const [copiedField, setCopiedField] = useState('');

  // Set data from location state or fetch from server
  useEffect(() => {
    if (articleDataFromState) {
      setArticleData(articleDataFromState);
      setSelectedProject(articleDataFromState.projectId || '');
    } else if (orderId) {
      // Fetch article data from server if we have an order ID
      fetchArticleData(orderId);
    } else {
      // Sample data - in a real app this would come from props or API
      setArticleData({
        articleTitle: 'How to Optimize Your Website for Better SEO Performance',
        permalinkSlug: 'optimize-website-seo-performance',
        anchorText: 'SEO optimization services',
        targetUrl: 'https://example.com/seo-services',
        postText: `Search engine optimization (SEO) is a crucial aspect of digital marketing that helps websites rank higher in search engine results pages (SERPs). By implementing effective SEO strategies, businesses can increase their online visibility, attract more organic traffic, and ultimately drive more conversions.

Key SEO techniques include keyword research, on-page optimization, content creation, link building, and technical SEO. Each of these elements plays a vital role in improving your website's search engine rankings.

Keyword research involves identifying the terms and phrases your target audience uses when searching for products or services like yours. By targeting the right keywords, you can attract highly relevant traffic to your website.

On-page optimization focuses on optimizing individual web pages to rank higher and earn more relevant traffic. This includes optimizing title tags, meta descriptions, header tags, and content.

Content creation is essential for SEO success. High-quality, relevant content not only attracts visitors but also encourages other websites to link to your content, which boosts your site's authority.

Link building involves acquiring high-quality backlinks from other reputable websites. These backlinks act as votes of confidence, signaling to search engines that your content is valuable and trustworthy.

Technical SEO ensures your website is easily crawlable and indexable by search engines. This includes improving site speed, mobile responsiveness, and fixing any technical issues that may hinder your site's performance.`,
        metaTitle: 'SEO Optimization Guide: Boost Your Website Rankings',
        metaKeywords: 'SEO, search engine optimization, website ranking, digital marketing',
        metaDescription: 'Learn how to optimize your website for better SEO performance and higher search engine rankings with our comprehensive guide.'
      });
      setSelectedProject('2');
    }
  }, [articleDataFromState, orderId]);

  // Fetch article data from server
  const fetchArticleData = async (orderId) => {
    try {
      const response = await orderAPI.getArticleData(orderId);
      if (response.data && response.data.ok) {
        setArticleData(response.data.data);
        setSelectedProject(response.data.data.projectId || '');
      }
    } catch (error) {
      console.error('Error fetching article data:', error);
      // Fallback to sample data
      setArticleData({
        articleTitle: 'How to Optimize Your Website for Better SEO Performance',
        permalinkSlug: 'optimize-website-seo-performance',
        anchorText: 'SEO optimization services',
        targetUrl: 'https://example.com/seo-services',
        postText: `Search engine optimization (SEO) is a crucial aspect of digital marketing that helps websites rank higher in search engine results pages (SERPs). By implementing effective SEO strategies, businesses can increase their online visibility, attract more organic traffic, and ultimately drive more conversions.

Key SEO techniques include keyword research, on-page optimization, content creation, link building, and technical SEO. Each of these elements plays a vital role in improving your website's search engine rankings.

Keyword research involves identifying the terms and phrases your target audience uses when searching for products or services like yours. By targeting the right keywords, you can attract highly relevant traffic to your website.

On-page optimization focuses on optimizing individual web pages to rank higher and earn more relevant traffic. This includes optimizing title tags, meta descriptions, header tags, and content.

Content creation is essential for SEO success. High-quality, relevant content not only attracts visitors but also encourages other websites to link to your content, which boosts your site's authority.

Link building involves acquiring high-quality backlinks from other reputable websites. These backlinks act as votes of confidence, signaling to search engines that your content is valuable and trustworthy.

Technical SEO ensures your website is easily crawlable and indexable by search engines. This includes improving site speed, mobile responsiveness, and fixing any technical issues that may hinder your site's performance.`,
        metaTitle: 'SEO Optimization Guide: Boost Your Website Rankings',
        metaKeywords: 'SEO, search engine optimization, website ranking, digital marketing',
        metaDescription: 'Learn how to optimize your website for better SEO performance and higher search engine rankings with our comprehensive guide.'
      });
      setSelectedProject('2');
    }
  };

  // Function to copy text to clipboard
  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 2000); // Reset after 2 seconds
    });
  };

  const handleCancel = () => {
    navigate('/publisher/sales');
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#bff747]">Article Details</h1>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="bg-[#1a1a1a] rounded-lg border border-[#bff747]/30 p-6">
          <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <h3 className="font-medium text-blue-400 mb-1">Order Details</h3>
            <p className="text-sm text-blue-300">
              View the article details below. Click the copy icon next to any field to copy its content.
            </p>
          </div>

          <form className="space-y-6">
            {/* Project Selection */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Project
                </label>
              </div>
              <div className="relative">
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-3 py-2 bg-[#2d2d2d] border border-[#bff747]/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#bff747]"
                  disabled
                >
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => copyToClipboard(projects.find(p => p.id == selectedProject)?.name, 'project')}
                  className="absolute right-2 top-2 text-[#bff747] hover:text-[#a8e035]"
                >
                  <ClipboardIcon className="h-5 w-5" />
                </button>
              </div>
              {copiedField === 'project' && (
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
                    <button
                      type="button"
                      onClick={() => copyToClipboard(articleData.articleTitle, 'title')}
                      className="text-[#bff747] hover:text-[#a8e035]"
                    >
                      <ClipboardIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    id="articleTitle"
                    value={articleData.articleTitle}
                    className="w-full px-3 py-2 bg-[#2d2d2d] border border-[#bff747]/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#bff747]"
                    readOnly
                  />
                  {copiedField === 'title' && (
                    <div className="text-xs text-[#bff747] mt-1">Copied to clipboard!</div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="permalinkSlug" className="block text-sm font-medium text-gray-300">
                      Permalink Slug
                    </label>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(articleData.permalinkSlug, 'slug')}
                      className="text-[#bff747] hover:text-[#a8e035]"
                    >
                      <ClipboardIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    id="permalinkSlug"
                    value={articleData.permalinkSlug}
                    className="w-full px-3 py-2 bg-[#2d2d2d] border border-[#bff747]/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#bff747]"
                    readOnly
                  />
                  {copiedField === 'slug' && (
                    <div className="text-xs text-[#bff747] mt-1">Copied to clipboard!</div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="anchorText" className="block text-sm font-medium text-gray-300">
                      Anchor Text
                    </label>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(articleData.anchorText, 'anchor')}
                      className="text-[#bff747] hover:text-[#a8e035]"
                    >
                      <ClipboardIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    id="anchorText"
                    value={articleData.anchorText}
                    className="w-full px-3 py-2 bg-[#2d2d2d] border border-[#bff747]/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#bff747]"
                    readOnly
                  />
                  {copiedField === 'anchor' && (
                    <div className="text-xs text-[#bff747] mt-1">Copied to clipboard!</div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="targetUrl" className="block text-sm font-medium text-gray-300">
                      Target URL
                    </label>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(articleData.targetUrl, 'url')}
                      className="text-[#bff747] hover:text-[#a8e035]"
                    >
                      <ClipboardIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <input
                    type="url"
                    id="targetUrl"
                    value={articleData.targetUrl}
                    className="w-full px-3 py-2 bg-[#2d2d2d] border border-[#bff747]/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#bff747]"
                    readOnly
                  />
                  {copiedField === 'url' && (
                    <div className="text-xs text-[#bff747] mt-1">Copied to clipboard!</div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="postText" className="block text-sm font-medium text-gray-300">
                      Post Text
                    </label>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(articleData.postText, 'post')}
                      className="text-[#bff747] hover:text-[#a8e035]"
                    >
                      <ClipboardIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <textarea
                    id="postText"
                    value={articleData.postText}
                    rows={8}
                    className="w-full px-3 py-2 bg-[#2d2d2d] border border-[#bff747]/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#bff747]"
                    readOnly
                  />
                  {copiedField === 'post' && (
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
                    <button
                      type="button"
                      onClick={() => copyToClipboard(articleData.metaTitle, 'metaTitle')}
                      className="text-[#bff747] hover:text-[#a8e035]"
                    >
                      <ClipboardIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    id="metaTitle"
                    value={articleData.metaTitle}
                    className="w-full px-3 py-2 bg-[#2d2d2d] border border-[#bff747]/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#bff747]"
                    readOnly
                  />
                  {copiedField === 'metaTitle' && (
                    <div className="text-xs text-[#bff747] mt-1">Copied to clipboard!</div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="metaKeywords" className="block text-sm font-medium text-gray-300">
                      Meta Keywords
                    </label>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(articleData.metaKeywords, 'metaKeywords')}
                      className="text-[#bff747] hover:text-[#a8e035]"
                    >
                      <ClipboardIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    id="metaKeywords"
                    value={articleData.metaKeywords}
                    className="w-full px-3 py-2 bg-[#2d2d2d] border border-[#bff747]/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#bff747]"
                    readOnly
                  />
                  {copiedField === 'metaKeywords' && (
                    <div className="text-xs text-[#bff747] mt-1">Copied to clipboard!</div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-300">
                      Meta Description
                    </label>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(articleData.metaDescription, 'metaDescription')}
                      className="text-[#bff747] hover:text-[#a8e035]"
                    >
                      <ClipboardIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <textarea
                    id="metaDescription"
                    value={articleData.metaDescription}
                    rows={3}
                    className="w-full px-3 py-2 bg-[#2d2d2d] border border-[#bff747]/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#bff747]"
                    readOnly
                  />
                  {copiedField === 'metaDescription' && (
                    <div className="text-xs text-[#bff747] mt-1">Copied to clipboard!</div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Sales
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Article;