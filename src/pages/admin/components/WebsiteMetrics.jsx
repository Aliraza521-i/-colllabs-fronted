import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../../services/api';
import { 
  ChartBarIcon, 
  MagnifyingGlassIcon, 
  ArrowsUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const WebsiteMetrics = () => {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('domain');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [limit] = useState(10);
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [metricsForm, setMetricsForm] = useState({});

  // Fetch all websites
  const fetchWebsites = async (page = 1) => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllWebsites({
        page,
        limit,
        search: searchTerm,
        sortBy,
        sortOrder
      });
      
      if (response.data && response.data.ok) {
        setWebsites(response.data.data);
        setTotalPages(response.data.pagination.pages);
        setCurrentPage(response.data.pagination.current);
      }
    } catch (error) {
      console.error('Error fetching websites:', error);
      setError('Failed to fetch websites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebsites(currentPage);
  }, [currentPage, searchTerm, sortBy, sortOrder]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleEditMetrics = (website) => {
    setSelectedWebsite(website);
    // Initialize form with existing metrics or empty values
    setMetricsForm({
      domainAuthority: website.metrics?.domainAuthority || website.metrics?.da || '',
      pageAuthority: website.metrics?.pageAuthority || website.metrics?.pa || '',
      spamScore: website.metrics?.spamScore || website.metrics?.ss || '',
      domainAge: website.metrics?.domainAge || '',
      ahrefsDomainRating: website.metrics?.ahrefsDomainRating || website.metrics?.dr || '',
      urlRating: website.metrics?.urlRating || website.metrics?.ur || '',
      ahrefsTraffic: website.metrics?.ahrefsTraffic || '',
      ahrefsKeywords: website.metrics?.ahrefsKeywords || '',
      semrushAuthorityScore: website.metrics?.semrushAuthorityScore || '',
      semrushTraffic: website.metrics?.semrushTraffic || '',
      semrushKeywords: website.metrics?.semrushKeywords || '',
      semrushReferringDomains: website.metrics?.semrushReferringDomains || '',
      majesticTrustFlow: website.metrics?.majesticTrustFlow || website.metrics?.tf || '',
      majesticCitationFlow: website.metrics?.majesticCitationFlow || website.metrics?.cf || '',
      majesticTotalIndex: website.metrics?.majesticTotalIndex || '',
      referringDomains: website.metrics?.referringDomains || '',
      monthlyTraffic: website.metrics?.monthlyTraffic || '',
      organicTraffic: website.metrics?.organicTraffic || '',
      externalLinks: website.metrics?.externalLinks || '',
      mozRank: website.metrics?.mozRank || ''
    });
    setShowEditModal(true);
  };

  const handleMetricsChange = (e) => {
    const { name, value } = e.target;
    setMetricsForm(prev => ({
      ...prev,
      [name]: value === '' ? '' : Number(value)
    }));
  };

  const handleSaveMetrics = async (e) => {
    e.preventDefault();
    try {
      const response = await adminAPI.updateWebsiteMetrics(selectedWebsite._id, {
        metrics: metricsForm
      });
      
      if (response.data && response.data.ok) {
        // Update the website in the list
        setWebsites(prev => prev.map(website => 
          website._id === selectedWebsite._id 
            ? { ...website, metrics: metricsForm }
            : website
        ));
        setShowEditModal(false);
        setSelectedWebsite(null);
      }
    } catch (error) {
      console.error('Error updating metrics:', error);
      setError('Failed to update metrics');
    }
  };

  const renderSortIcon = (field) => {
    if (sortBy === field) {
      return (
        <ArrowsUpDownIcon className={`h-4 w-4 inline ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <ChartBarIcon className="h-6 w-6 mr-2 text-blue-600" />
          Website Metrics Management
        </h1>
        <p className="text-gray-600 mt-2">
          Manage SEO metrics for all websites in the platform
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-33 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search websites..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Websites Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('domain')}
              >
                <div className="flex items-center">
                  Domain {renderSortIcon('domain')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('category')}
              >
                <div className="flex items-center">
                  Category {renderSortIcon('category')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  Status {renderSortIcon('status')}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Moz DA
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ahrefs DR
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Semrush AS
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {websites.map((website) => (
              <tr key={website._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{website.domain}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{website.category}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${website.status === 'approved' ? 'bg-green-100 text-green-800' : 
                      website.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' : 
                      website.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                      'bg-gray-100 text-gray-800'}`}>
                    {website.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {website.metrics?.domainAuthority || website.metrics?.da || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {website.metrics?.ahrefsDomainRating || website.metrics?.dr || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {website.metrics?.semrushAuthorityScore || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEditMetrics(website)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit Metrics
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                currentPage === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <ChevronLeftIcon className="h-5 w-5" />
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                currentPage === totalPages 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Next
              <ChevronRightIcon className="h-5 w-5 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Edit Metrics Modal */}
      {showEditModal && selectedWebsite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Edit SEO Metrics for {selectedWebsite.domain}
              </h2>
            </div>
            
            <form onSubmit={handleSaveMetrics} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Moz Metrics */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-3">Moz Metrics</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Domain Authority (DA)</label>
                      <input
                        type="number"
                        name="domainAuthority"
                        min="0"
                        max="100"
                        value={metricsForm.domainAuthority}
                        onChange={handleMetricsChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Page Authority (PA)</label>
                      <input
                        type="number"
                        name="pageAuthority"
                        min="0"
                        max="100"
                        value={metricsForm.pageAuthority}
                        onChange={handleMetricsChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Spam Score (SS)</label>
                      <input
                        type="number"
                        name="spamScore"
                        min="0"
                        max="100"
                        value={metricsForm.spamScore}
                        onChange={handleMetricsChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Domain Age</label>
                      <input
                        type="number"
                        name="domainAge"
                        min="0"
                        value={metricsForm.domainAge}
                        onChange={handleMetricsChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Ahrefs Metrics */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-3">Ahrefs Metrics</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Domain Rating (DR)</label>
                      <input
                        type="number"
                        name="ahrefsDomainRating"
                        min="0"
                        max="100"
                        value={metricsForm.ahrefsDomainRating}
                        onChange={handleMetricsChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">URL Rating (UR)</label>
                      <input
                        type="number"
                        name="urlRating"
                        min="0"
                        max="100"
                        value={metricsForm.urlRating}
                        onChange={handleMetricsChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Traffic</label>
                      <input
                        type="number"
                        name="ahrefsTraffic"
                        min="0"
                        value={metricsForm.ahrefsTraffic}
                        onChange={handleMetricsChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Keywords</label>
                      <input
                        type="number"
                        name="ahrefsKeywords"
                        min="0"
                        value={metricsForm.ahrefsKeywords}
                        onChange={handleMetricsChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
                
                {/* SEMrush Metrics */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-3">SEMrush Metrics</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Authority Score (AS)</label>
                      <input
                        type="number"
                        name="semrushAuthorityScore"
                        min="0"
                        max="100"
                        value={metricsForm.semrushAuthorityScore}
                        onChange={handleMetricsChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Traffic</label>
                      <input
                        type="number"
                        name="semrushTraffic"
                        min="0"
                        value={metricsForm.semrushTraffic}
                        onChange={handleMetricsChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Keywords</label>
                      <input
                        type="number"
                        name="semrushKeywords"
                        min="0"
                        value={metricsForm.semrushKeywords}
                        onChange={handleMetricsChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Referring Domains</label>
                      <input
                        type="number"
                        name="semrushReferringDomains"
                        min="0"
                        value={metricsForm.semrushReferringDomains}
                        onChange={handleMetricsChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Majestic Metrics */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-3">Majestic Metrics</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Trust Flow (TF)</label>
                      <input
                        type="number"
                        name="majesticTrustFlow"
                        min="0"
                        max="100"
                        value={metricsForm.majesticTrustFlow}
                        onChange={handleMetricsChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Citation Flow (CF)</label>
                      <input
                        type="number"
                        name="majesticCitationFlow"
                        min="0"
                        max="100"
                        value={metricsForm.majesticCitationFlow}
                        onChange={handleMetricsChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Total Index</label>
                      <input
                        type="number"
                        name="majesticTotalIndex"
                        min="0"
                        value={metricsForm.majesticTotalIndex}
                        onChange={handleMetricsChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save Metrics
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebsiteMetrics;