import React from 'react';
import { ArrowLeftIcon, GlobeAltIcon, TagIcon, CurrencyDollarIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const ProjectDetails = ({ project, onBack, onRefresh }) => {
  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">{project.title}</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Project details and information</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onRefresh}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-0.5 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Refresh
            </button>
            <button
              onClick={onBack}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeftIcon className="-ml-0.5 mr-2 h-4 w-4 text-gray-500" />
              Back to List
            </button>
          </div>
        </div>
      </div>
      <div className="px-4 py-5 sm:px-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Project Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Project Information</h4>
            <dl className="grid grid-cols-1 gap-2">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Project ID</dt>
                <dd className="text-sm font-medium text-gray-900">{project.id || project._id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Status</dt>
                <dd className="text-sm font-medium text-gray-900">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(project.status)}`}>
                    {project.status}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Created Date</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Language</dt>
                <dd className="text-sm font-medium text-gray-900">{project.language || 'English'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Advertiser</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {project.userId?.firstName ? `${project.userId.firstName} ${project.userId.lastName}` : project.advertiserName || 'N/A'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Advertiser Email</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {project.userId?.email || project.advertiserEmail || 'N/A'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Budget Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Budget Information</h4>
            <dl className="grid grid-cols-1 gap-2">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Total Budget</dt>
                <dd className="text-sm font-medium text-gray-900">${project.budget?.toFixed(2) || '0.00'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Min Post Budget</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {project.minPostBudget ? `$${project.minPostBudget.toFixed(2)}` : 'Not set'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Max Post Budget</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {project.maxPostBudget ? `$${project.maxPostBudget.toFixed(2)}` : 'Not set'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Posts Required</dt>
                <dd className="text-sm font-medium text-gray-900">{project.postsRequired || '0'}</dd>
              </div>
            </dl>
          </div>

          {/* Website Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Website Information</h4>
            <dl className="grid grid-cols-1 gap-2">
              <div className="flex items-start">
                <GlobeAltIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                <div>
                  <dt className="text-sm text-gray-500">Website URL</dt>
                  <dd className="text-sm font-medium text-gray-900 break-all">{project.website}</dd>
                </div>
              </div>
              <div className="flex items-start">
                <TagIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                <div>
                  <dt className="text-sm text-gray-500">Categories</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    <div className="flex flex-wrap gap-1 mt-1">
                      {project.categories?.map((category, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {category}
                        </span>
                      ))}
                    </div>
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </div>

        {/* Description */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Description</h4>
          <p className="text-sm text-gray-700">
            {project.description || 'No description provided.'}
          </p>
        </div>

        {/* Stats */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Project Statistics</h4>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                    <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Finished Posts</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{project.stats?.finishedPosts || 0}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Active Posts</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{project.stats?.activePosts || 0}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Reviews</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{project.stats?.pendingReviews || 0}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                    <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{project.stats?.totalOrders || 0}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;