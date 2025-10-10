import React from 'react';

const UserHeader = ({ selectedUsers, handleBulkAction, fetchUsers, loading, actionLoading }) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600">Manage all users, permissions, and account settings</p>
      </div>
      <div className="flex space-x-3">
        {selectedUsers.length > 0 && (
          <div className="flex space-x-2">
            <button
              onClick={() => handleBulkAction('activate')}
              disabled={actionLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Activate Selected
            </button>
            <button
              onClick={() => handleBulkAction('suspend')}
              disabled={actionLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              Suspend Selected
            </button>
          </div>
        )}
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    </div>
  );
};

export default UserHeader;