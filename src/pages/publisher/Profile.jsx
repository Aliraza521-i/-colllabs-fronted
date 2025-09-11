import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userAPI } from '../../services/api';

const Profile = () => {
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
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-[#0c0c0c] rounded-lg shadow-md p-6 border border-[#bff747]/30">
        <h1 className="text-2xl font-bold text-[#bff747] mb-6">My Profile</h1>
        
        {message.text && (
          <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-900/30 text-green-400 border border-green-500/30' : 'bg-red-900/30 text-red-400 border border-red-500/30'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-[#bff747] mb-1">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={profileData.firstName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[#bff747]/30 rounded-md bg-[#0c0c0c] text-[#bff747] focus:outline-none focus:ring-2 focus:ring-[#bff747] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-[#bff747] mb-1">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={profileData.lastName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[#bff747]/30 rounded-md bg-[#0c0c0c] text-[#bff747] focus:outline-none focus:ring-2 focus:ring-[#bff747] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#bff747] mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[#bff747]/30 rounded-md bg-[#0c0c0c] text-[#bff747] focus:outline-none focus:ring-2 focus:ring-[#bff747] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-[#bff747] mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={profileData.phoneNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[#bff747]/30 rounded-md bg-[#0c0c0c] text-[#bff747] focus:outline-none focus:ring-2 focus:ring-[#bff747] focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#bff747] text-[#0c0c0c] rounded-md hover:bg-[#bff747]/80 focus:outline-none focus:ring-2 focus:ring-[#bff747] font-medium disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;