import React, { useState } from 'react';
import { 
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    siteName: 'CollabsWorld',
    siteDescription: 'Premium link building platform',
    adminEmail: 'admin@collabsworld.com',
    notificationsEnabled: true,
    maintenanceMode: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would send the settings to the backend
    console.log('Saving settings:', settings);
    alert('Settings saved successfully!');
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">System Settings</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            <a href="#" className="bg-gray-100 text-gray-900 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
              <Cog6ToothIcon className="text-gray-500 group-hover:text-gray-700 mr-3 flex-shrink-0 h-6 w-6" />
              <span>General</span>
            </a>
            <a href="#" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
              <BellIcon className="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-6 w-6" />
              <span>Notifications</span>
            </a>
            <a href="#" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
              <ShieldCheckIcon className="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-6 w-6" />
              <span>Security</span>
            </a>
            <a href="#" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
              <CreditCardIcon className="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-6 w-6" />
              <span>Payment</span>
            </a>
            <a href="#" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
              <GlobeAltIcon className="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-6 w-6" />
              <span>SEO</span>
            </a>
          </nav>
        </div>
        
        {/* Settings Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="siteName" className="block text-sm font-medium text-gray-700">
                    Site Name
                  </label>
                  <input
                    type="text"
                    name="siteName"
                    id="siteName"
                    value={settings.siteName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700">
                    Site Description
                  </label>
                  <textarea
                    name="siteDescription"
                    id="siteDescription"
                    rows={3}
                    value={settings.siteDescription}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    name="adminEmail"
                    id="adminEmail"
                    value={settings.adminEmail}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="notificationsEnabled"
                    id="notificationsEnabled"
                    checked={settings.notificationsEnabled}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="notificationsEnabled" className="ml-2 block text-sm text-gray-700">
                    Enable email notifications
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="maintenanceMode"
                    id="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-700">
                    Maintenance Mode
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;