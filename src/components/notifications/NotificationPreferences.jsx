import React, { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BellIcon, 
  EnvelopeIcon, 
  DevicePhoneMobileIcon, 
  ComputerDesktopIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const NotificationPreferences = () => {
  const { preferences, loadPreferences, updatePreferences, loading, error } = useNotification();
  const { isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    email: {
      enabled: true,
      frequency: 'immediate'
    },
    sms: {
      enabled: false,
      frequency: 'immediate'
    },
    push: {
      enabled: true,
      frequency: 'immediate'
    },
    inApp: {
      enabled: true,
      showBadge: true
    },
    categories: {
      orders: true,
      payments: true,
      websites: true,
      messages: true,
      support: true,
      system: true,
    },
    doNotDisturb: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00'
    },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Only load preferences if user is authenticated
    if (isAuthenticated() && !preferences) {
      loadPreferences();
    }
    
    if (preferences) {
      setFormData(preferences);
    }
  }, [preferences, loadPreferences, isAuthenticated]);

  const handleChange = (section, field, value) => {
    // Only update if user is authenticated
    if (!isAuthenticated()) return;
    
    setFormData(prev => {
      if (section) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value
          }
        };
      } else {
        return {
          ...prev,
          [field]: value
        };
      }
    });
  };

  const handleCategoryChange = (category, value) => {
    // Only update if user is authenticated
    if (!isAuthenticated()) return;
    
    setFormData(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: value
      }
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Only save if user is authenticated
    if (!isAuthenticated()) return;
    
    try {
      setSaving(true);
      setSuccess(false);
      await updatePreferences(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update preferences:', err);
    } finally {
      setSaving(false);
    }
  };

  const categoryOptions = [
    { key: 'orders', label: 'Order Updates', description: 'Order creation, approval, payment status' },
    { key: 'payments', label: 'Payment Notifications', description: 'Payment received, escrow releases, withdrawals' },
    { key: 'websites', label: 'Website Management', description: 'Website approval, rejection, verification' },
    { key: 'messages', label: 'Messages', description: 'New messages from publishers/advertisers' },
    { key: 'support', label: 'Support Tickets', description: 'Support ticket updates' },
    { key: 'system', label: 'System Updates', description: 'Platform maintenance and updates' },
  ];

  const frequencyOptions = [
    { value: 'immediate', label: 'Immediately' },
    { value: 'daily_digest', label: 'Daily Digest' },
    { value: 'weekly_digest', label: 'Weekly Digest' },
    { value: 'disabled', label: 'Disabled' }
  ];

  // Show a message if user is not authenticated
  if (!isAuthenticated()) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <BellIcon className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Authentication Required</h3>
          <p className="mt-1 text-sm text-gray-500">
            Please log in to manage your notification preferences.
          </p>
        </div>
      </div>
    );
  }

  if (loading && !preferences) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center">
          <BellIcon className="h-6 w-6 text-gray-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
        </div>
      </div>
      
      <form onSubmit={handleSave} className="px-6 py-4 space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {success && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Preferences saved successfully!
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Email Notifications */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <EnvelopeIcon className="h-5 w-5 text-gray-500 mr-2" />
            <h4 className="text-md font-medium text-gray-900">Email Notifications</h4>
          </div>
          
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Enable Email Notifications</label>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <div className="relative inline-flex items-center">
                <button
                  type="button"
                  className={`${
                    formData.email.enabled ? 'bg-blue-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  onClick={() => handleChange('email', 'enabled', !formData.email.enabled)}
                >
                  <span
                    className={`${
                      formData.email.enabled ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  >
                    <span
                      className={`${
                        formData.email.enabled ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in'
                      } absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`}
                      aria-hidden="true"
                    >
                      <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
                        <path d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span
                      className={`${
                        formData.email.enabled ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out'
                      } absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`}
                      aria-hidden="true"
                    >
                      <svg className="h-3 w-3 text-blue-600" fill="currentColor" viewBox="0 0 12 12">
                        <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-5.707a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                      </svg>
                    </span>
                  </span>
                </button>
              </div>
            </div>
            
            {formData.email.enabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Frequency</label>
                <select
                  value={formData.email.frequency}
                  onChange={(e) => handleChange('email', 'frequency', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  {frequencyOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
        
        {/* SMS Notifications */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <DevicePhoneMobileIcon className="h-5 w-5 text-gray-500 mr-2" />
            <h4 className="text-md font-medium text-gray-900">SMS Notifications</h4>
          </div>
          
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Enable SMS Notifications</label>
                <p className="text-sm text-gray-500">Receive notifications via text message</p>
              </div>
              <div className="relative inline-flex items-center">
                <button
                  type="button"
                  className={`${
                    formData.sms.enabled ? 'bg-blue-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  onClick={() => handleChange('sms', 'enabled', !formData.sms.enabled)}
                >
                  <span
                    className={`${
                      formData.sms.enabled ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  >
                    <span
                      className={`${
                        formData.sms.enabled ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in'
                      } absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`}
                      aria-hidden="true"
                    >
                      <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
                        <path d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span
                      className={`${
                        formData.sms.enabled ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out'
                      } absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`}
                      aria-hidden="true"
                    >
                      <svg className="h-3 w-3 text-blue-600" fill="currentColor" viewBox="0 0 12 12">
                        <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-5.707a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                      </svg>
                    </span>
                  </span>
                </button>
              </div>
            </div>
            
            {formData.sms.enabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700">SMS Frequency</label>
                <select
                  value={formData.sms.frequency}
                  onChange={(e) => handleChange('sms', 'frequency', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  {frequencyOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
        
        {/* Push Notifications */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <ComputerDesktopIcon className="h-5 w-5 text-gray-500 mr-2" />
            <h4 className="text-md font-medium text-gray-900">Push Notifications</h4>
          </div>
          
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Enable Push Notifications</label>
                <p className="text-sm text-gray-500">Receive notifications in your browser</p>
              </div>
              <div className="relative inline-flex items-center">
                <button
                  type="button"
                  className={`${
                    formData.push.enabled ? 'bg-blue-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  onClick={() => handleChange('push', 'enabled', !formData.push.enabled)}
                >
                  <span
                    className={`${
                      formData.push.enabled ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  >
                    <span
                      className={`${
                        formData.push.enabled ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in'
                      } absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`}
                      aria-hidden="true"
                    >
                      <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
                        <path d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span
                      className={`${
                        formData.push.enabled ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out'
                      } absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`}
                      aria-hidden="true"
                    >
                      <svg className="h-3 w-3 text-blue-600" fill="currentColor" viewBox="0 0 12 12">
                        <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-5.707a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                      </svg>
                    </span>
                  </span>
                </button>
              </div>
            </div>
            
            {formData.push.enabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Push Frequency</label>
                <select
                  value={formData.push.frequency}
                  onChange={(e) => handleChange('push', 'frequency', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  {frequencyOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
        
        {/* In-App Notifications */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <BellIcon className="h-5 w-5 text-gray-500 mr-2" />
            <h4 className="text-md font-medium text-gray-900">In-App Notifications</h4>
          </div>
          
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Enable In-App Notifications</label>
                <p className="text-sm text-gray-500">Show notifications within the application</p>
              </div>
              <div className="relative inline-flex items-center">
                <button
                  type="button"
                  className={`${
                    formData.inApp.enabled ? 'bg-blue-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  onClick={() => handleChange('inApp', 'enabled', !formData.inApp.enabled)}
                >
                  <span
                    className={`${
                      formData.inApp.enabled ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  >
                    <span
                      className={`${
                        formData.inApp.enabled ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in'
                      } absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`}
                      aria-hidden="true"
                    >
                      <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
                        <path d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span
                      className={`${
                        formData.inApp.enabled ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out'
                      } absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`}
                      aria-hidden="true"
                    >
                      <svg className="h-3 w-3 text-blue-600" fill="currentColor" viewBox="0 0 12 12">
                        <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-5.707a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                      </svg>
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Notification Categories */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="text-md font-medium text-gray-900 mb-4">Notification Categories</h4>
          
          <div className="space-y-4">
            {categoryOptions.map(category => (
              <div key={category.key} className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">{category.label}</label>
                  <p className="text-sm text-gray-500">{category.description}</p>
                </div>
                <div className="relative inline-flex items-center">
                  <button
                    type="button"
                    className={`${
                      formData.categories[category.key] ? 'bg-blue-600' : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                    onClick={() => handleCategoryChange(category.key, !formData.categories[category.key])}
                  >
                    <span
                      className={`${
                        formData.categories[category.key] ? 'translate-x-5' : 'translate-x-0'
                      } pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    >
                      <span
                        className={`${
                          formData.categories[category.key] ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in'
                        } absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`}
                        aria-hidden="true"
                      >
                        <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
                          <path d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span
                        className={`${
                          formData.categories[category.key] ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out'
                        } absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`}
                        aria-hidden="true"
                      >
                        <svg className="h-3 w-3 text-blue-600" fill="currentColor" viewBox="0 0 12 12">
                          <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-5.707a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                        </svg>
                      </span>
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Do Not Disturb */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <ClockIcon className="h-5 w-5 text-gray-500 mr-2" />
            <h4 className="text-md font-medium text-gray-900">Do Not Disturb</h4>
          </div>
          
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Enable Do Not Disturb</label>
                <p className="text-sm text-gray-500">Mute notifications during specified hours</p>
              </div>
              <div className="relative inline-flex items-center">
                <button
                  type="button"
                  className={`${
                    formData.doNotDisturb.enabled ? 'bg-blue-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  onClick={() => handleChange('doNotDisturb', 'enabled', !formData.doNotDisturb.enabled)}
                >
                  <span
                    className={`${
                      formData.doNotDisturb.enabled ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  >
                    <span
                      className={`${
                        formData.doNotDisturb.enabled ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in'
                      } absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`}
                      aria-hidden="true"
                    >
                      <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
                        <path d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span
                      className={`${
                        formData.doNotDisturb.enabled ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out'
                      } absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`}
                      aria-hidden="true"
                    >
                      <svg className="h-3 w-3 text-blue-600" fill="currentColor" viewBox="0 0 12 12">
                        <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-5.707a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                      </svg>
                    </span>
                  </span>
                </button>
              </div>
            </div>
            
            {formData.doNotDisturb.enabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <input
                    type="time"
                    value={formData.doNotDisturb.startTime}
                    onChange={(e) => handleChange('doNotDisturb', 'startTime', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Time</label>
                  <input
                    type="time"
                    value={formData.doNotDisturb.endTime}
                    onChange={(e) => handleChange('doNotDisturb', 'endTime', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Preferences'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NotificationPreferences;