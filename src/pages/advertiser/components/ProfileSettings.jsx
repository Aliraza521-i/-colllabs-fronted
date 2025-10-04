import React, { useState, useEffect, useRef } from 'react';
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
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || ''
      });
      setProfileImagePreview(user.profileImage || null);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please select an image file' });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'File size should be less than 5MB' });
        return;
      }
      
      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      setMessage({ type: '', text: '' });
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const removeProfileImage = () => {
    setProfileImage(null);
    setProfileImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // If there's a new profile image, upload it first
      let profileImageUrl = user?.profileImage || null;
      if (profileImage) {
        const formData = new FormData();
        formData.append('profileImage', profileImage);
        
        const imageResponse = await userAPI.uploadProfileImage(formData);
        if (imageResponse.data.ok) {
          profileImageUrl = imageResponse.data.data.profileImage;
        } else {
          throw new Error(imageResponse.data.message || 'Failed to upload profile image');
        }
      }
      
      // Update profile data
      const response = await userAPI.updateProfile({
        ...profileData,
        profileImage: profileImageUrl
      });
      
      if (response.data.ok) {
        // Update the user in context
        const updatedUser = {
          ...user,
          ...profileData,
          profileImage: profileImageUrl
        };
        updateUser(updatedUser);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setMessage({ type: 'error', text: response.data.message || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile. Please try again.' });
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

          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Image Section */}
            <div className="md:w-1/3 flex flex-col items-center">
              <div className="relative">
                <div 
                  className="w-32 h-32 rounded-full bg-gray-700 border-2 border-[#bff747]/30 overflow-hidden cursor-pointer flex items-center justify-center"
                  onClick={handleImageClick}
                >
                  {profileImagePreview ? (
                    <img 
                      src={profileImagePreview} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs mt-2 block">Click to upload</span>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {profileImagePreview && (
                  <button
                    type="button"
                    onClick={removeProfileImage}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-600"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">Click on image to change profile picture</p>
              <p className="text-xs text-gray-500 mt-1 text-center">Max file size: 5MB</p>
            </div>

            {/* Profile Form Section */}
            <div className="md:w-2/3">
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
      </div>
    </div>
  );
};

export default ProfileSettings;