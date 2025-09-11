import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { advertiserAPI } from '../../../services/api';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { GlobeAltIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

const FavoriteWebsites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await advertiserAPI.getFavorites();
      if (response.data && response.data.ok) {
        // Fix: Use the correct response structure from backend
        setFavorites(response.data.favorites || []);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch favorites');
      }
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
      setError(error.message || 'Failed to load favorite websites. Please try again later.');
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = async (websiteId) => {
    try {
      await advertiserAPI.removeFromFavorites(websiteId);
      setFavorites(prev => prev.filter(website => website._id !== websiteId));
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
      // Optionally show an error message to the user
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1a1a1a] rounded-lg shadow p-6 border border-[#bff747]/30">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-900/30">
            <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="mt-2 text-lg font-medium text-[#bff747]">Error Loading Favorites</h3>
          <p className="mt-1 text-sm text-gray-400">{error}</p>
          <div className="mt-6">
            <button
              type="button"
              onClick={fetchFavorites}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-[#0c0c0c] bg-[#bff747] hover:bg-[#a8e035] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#bff747]"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1a] rounded-lg shadow p-6 border border-[#bff747]/30">
      <h2 className="text-2xl font-bold text-[#bff747] mb-6">Favorite Websites</h2>
      
      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-[#2a2a2a] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-[#bff747]/20">
            <HeartSolidIcon className="h-8 w-8 text-[#bff747]" />
          </div>
          <h3 className="text-lg font-medium text-[#bff747] mb-2">No favorite websites yet</h3>
          <p className="text-gray-400 mb-6">Start browsing websites and add them to your favorites to see them here.</p>
          <button 
            onClick={() => navigate('/advertiser/browse')}
            className="bg-[#bff747] hover:bg-[#a8e035] text-[#0c0c0c] font-medium py-2 px-4 rounded-lg transition duration-200"
          >
            Browse Websites
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((website) => (
            <div key={website._id} className="border border-[#bff747]/30 rounded-lg p-4 hover:shadow-md transition duration-200 bg-[#1a1a1a]">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                  <GlobeAltIcon className="h-5 w-5 text-[#bff747]" />
                  <h3 className="font-semibold text-[#bff747] truncate">{website.domain}</h3>
                </div>
                <button 
                  onClick={() => removeFromFavorites(website._id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <HeartSolidIcon className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-gray-300 mb-3 line-clamp-2">{website.siteDescription}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-[#bff747]">{formatPrice(website.publishingPrice)}/post</span>
                <button 
                  onClick={() => navigate(`/advertiser/browse/${website._id}`)}
                  className="text-[#bff747] hover:text-[#a8e035] text-sm font-medium"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoriteWebsites;