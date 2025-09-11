import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { userAPI } from '../../../services/api';

const ProfileSettings = () => {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await userAPI.updateProfile(profileData);
      if (response.data.ok) {
        // Update the user in context
        const updatedUser = {
          ...user,
          ...profileData
        };
        updateUser(updatedUser);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setMessage({ type: 'error', text: response.data.message || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="bg-[#1a1a1a] shadow rounded-lg border border-[#bff747]/30">
        <div className="px-4 py-5 sm:px-6 border-b border-[#bff747]/30">
          <h3 className="text-lg leading-6 font-medium text-[#bff747]">Profile Information</h3>
          <p className="mt-1 text-sm text-gray-400">
            Update your personal information here.
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          {message.text && (
            <div className={`mb-4 p-4 rounded ${
              message.type === 'success' 
                ? 'bg-green-900/30 text-green-400 border border-green-500/30' 
                : 'bg-red-900/30 text-red-400 border border-red-500/30'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-[#bff747]/30 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#bff747] focus:border-[#bff747] sm:text-sm bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-[#bff747]/30 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#bff747] focus:border-[#bff747] sm:text-sm bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-[#bff747]/30 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#bff747] focus:border-[#bff747] sm:text-sm bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={profileData.phoneNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-[#bff747]/30 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#bff747] focus:border-[#bff747] sm:text-sm bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-[#0c0c0c] bg-[#bff747] hover:bg-[#a8e035] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#bff747] disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;