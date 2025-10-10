import React, { useState, useEffect, useCallback } from 'react';
import {
  UsersIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  LockClosedIcon,
  LockOpenIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  MinusIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { adminAPI } from '../../../../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import UserTable from './UserTable';
import UserFilters from './UserFilters';
import UserPagination from './UserPagination';
import UserHeader from './UserHeader';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [balanceAction, setBalanceAction] = useState('add');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [balanceError, setBalanceError] = useState('');
  const [balanceSuccess, setBalanceSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const usersPerPage = 20;

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUsers({
        page: currentPage,
        limit: usersPerPage,
        role: selectedRole !== 'all' ? selectedRole : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        search: searchTerm || undefined
      });

      console.log('Users API Response:', response);
      
      if (response.data && response.data.ok) {
        console.log('Users Data:', response.data.data);
        setUsers(response.data.data); // Access the data array correctly
        setTotalPages(response.data.pagination?.pages || 1);
      } else {
        console.log('API response not ok or missing data');
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedRole, selectedStatus, searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUserAction = async (userId, action, data = {}) => {
    try {
      setActionLoading(true);
      let response;

      switch (action) {
        case 'suspend':
          response = await adminAPI.suspendUser(userId, data.reason || 'Admin action');
          break;
        case 'activate':
          response = await adminAPI.activateUser(userId);
          break;
        case 'delete':
          response = await adminAPI.deleteUser(userId);
          break;
        case 'verify':
          response = await adminAPI.verifyUser(userId);
          break;
        case 'update':
          response = await adminAPI.updateUser(userId, data);
          break;
        default:
          return;
      }

      if (response.ok) {
        fetchUsers();
        setShowUserModal(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
    } finally {
      setActionLoading(false);
    }
  };

  // Add this new function for balance management
  const handleUpdateBalance = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!amount || parseFloat(amount) <= 0) {
      setBalanceError('Please enter a valid amount');
      return;
    }
    
    if (!description.trim()) {
      setBalanceError('Please enter a description');
      return;
    }
    
    try {
      setActionLoading(true);
      setBalanceError('');
      
      const response = await adminAPI.updateUserBalance(selectedUser._id, {
        amount: parseFloat(amount),
        action: balanceAction,
        description: description.trim()
      });
      
      if (response.data && response.data.ok) {
        setBalanceSuccess('Balance updated successfully');
        // Refresh the user list
        fetchUsers();
        // Close modal after a delay
        setTimeout(() => {
          setShowBalanceModal(false);
          setSelectedUser(null);
          setAmount('');
          setDescription('');
          setBalanceSuccess('');
        }, 1500);
      }
    } catch (error) {
      console.error('Failed to update balance:', error);
      setBalanceError(error.response?.data?.message || 'Failed to update balance');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) return;

    try {
      setActionLoading(true);
      const response = await adminAPI.bulkUserAction(selectedUsers, action);
      
      if (response.ok) {
        fetchUsers();
        setSelectedUsers([]);
      }
    } catch (error) {
      console.error(`Failed to perform bulk ${action}:`, error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user._id));
    }
  };
const closeUserModal = () => {
  setShowUserModal(false);
  setSelectedUser(null);
};


  const getUserStatusBadge = (user) => {
    if (user.isSuspended) {
      return <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">Suspended</span>;
    }
    if (!user.isEmailVerified) {
      return <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">Unverified</span>;
    }
    if (user.isActive) {
      return <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">Active</span>;
    }
    return <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">Inactive</span>;
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      publisher: 'bg-blue-100 text-blue-800',
      advertiser: 'bg-green-100 text-green-800'
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[role]}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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

      <UserHeader 
        selectedUsers={selectedUsers}
        handleBulkAction={handleBulkAction}
        fetchUsers={fetchUsers}
        loading={loading}
        actionLoading={actionLoading}
      />

      {/* Filters and Search */}
      <UserFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
      />

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Users ({users.length} of {totalPages * usersPerPage})
            </h3>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedUsers.length === users.length && users.length > 0}
                onChange={handleSelectAll}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-700">Select All</label>
            </div>
          </div>
        </div>

        <UserTable
          users={users}
          selectedUsers={selectedUsers}
          handleSelectUser={handleSelectUser}
          handleSelectAll={handleSelectAll}
          getUserStatusBadge={getUserStatusBadge}
          getRoleBadge={getRoleBadge}
          formatDate={formatDate}
          setShowUserModal={setShowUserModal}
          setSelectedUser={setSelectedUser}
          setShowBalanceModal={setShowBalanceModal}
          handleUserAction={handleUserAction}
          actionLoading={actionLoading}
          totalPages={totalPages}
          usersPerPage={usersPerPage}
        />
      </div>

      {/* Pagination */}
      <UserPagination
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        usersPerPage={usersPerPage}
      />

      {/* User Details Modal */}
  {showUserModal && selectedUser && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    onClick={closeUserModal} // closes when clicking outside
  >
    <div
      className="bg-white rounded-lg shadow-xl sm:max-w-4xl w-full mx-4"
      onClick={(e) => e.stopPropagation()} // stops clicks inside from closing
    >
      <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            User Details: {selectedUser.firstName} {selectedUser.lastName}
          </h3>
          <button
            onClick={closeUserModal} // close on cross
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-8">
            {['profile', 'activity', 'websites', 'orders'].map((tab) => (
              <button
                key={tab}
                onClick={() => {/* if you keep activeTab state, update it here */}}
                className="py-2 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Body (example: profile content) */}
        <div className="max-h-96 overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <p className="mt-1 text-sm text-gray-900">{selectedUser.phoneNumber || 'Not provided'}</p>
            </div>
            {/* other fields... */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Account Balance</label>
              <p className="mt-1 text-sm text-gray-900">
                ${selectedUser.stats?.balance?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with actions — use your existing handleUserAction */}
      <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <div className="flex space-x-3">
          {selectedUser.isSuspended ? (
            <button
              onClick={() => handleUserAction(selectedUser._id, 'activate')}
              disabled={actionLoading}
              className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 disabled:opacity-50 sm:text-sm"
            >
              Activate User
            </button>
          ) : (
            <button
              onClick={() => handleUserAction(selectedUser._1d, 'suspend', { reason: 'Admin action' })}
              disabled={actionLoading}
              className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 disabled:opacity-50 sm:text-sm"
            >
              Suspend User
            </button>
          )}

          <button
            onClick={closeUserModal}
            className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}



      {/* Balance Management Modal */}
    {showBalanceModal && selectedUser && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    onClick={() => setShowBalanceModal(false)} // closes when clicking outside
  >
    <div
      className="bg-white rounded-lg shadow-xl sm:max-w-lg w-full mx-4"
      onClick={(e) => e.stopPropagation()} // stops click inside from closing
    >
      <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Manage Balance for {selectedUser.firstName} {selectedUser.lastName}
          </h3>
          <button
            onClick={() => setShowBalanceModal(false)} // close on cross
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="mt-2">
          <div className="bg-white p-4 rounded-lg mb-4 border border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Current Balance</span>
              <span className="text-lg font-bold text-gray-900">
                ${selectedUser.stats?.balance?.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>

          {balanceError && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {balanceError}
            </div>
          )}

          {balanceSuccess && (
            <div className="mb-4 text-sm text-green-600 bg-green-50 p-3 rounded-md">
              {balanceSuccess}
            </div>
          )}

          <form onSubmit={handleUpdateBalance}>
            <div className="space-y-4">
              {/* Action Buttons */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBalanceAction('add')}
                    className={`flex items-center justify-center px-4 py-2 border rounded-md ${
                      balanceAction === 'add'
                        ? 'bg-green-100 border-green-500 text-green-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add Funds
                  </button>
                  <button
                    type="button"
                    onClick={() => setBalanceAction('deduct')}
                    className={`flex items-center justify-center px-4 py-2 border rounded-md ${
                      balanceAction === 'deduct'
                        ? 'bg-red-100 border-red-500 text-red-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <MinusIcon className="h-4 w-4 mr-1" />
                    Deduct Funds
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Amount ($)
                </label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Reason for balance adjustment..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-5 sm:grid sm:grid-cols-2 sm:gap-3">
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Update Balance'}
              </button>
              <button
                type="button"
                onClick={() => setShowBalanceModal(false)} // close on Cancel
                className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

// User Details Modal Component
const UserDetailsModal = ({ user, onClose, onAction, loading }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const { switchRole } = useAuth();
  const navigate = useNavigate();

  const handleRoleSwitch = (newRole) => {
    const updatedUser = switchRole(newRole);
    if (updatedUser) {
      // Redirect based on new role
      switch (newRole) {
        case 'publisher':
          navigate('/publisher');
          break;
        case 'advertiser':
          navigate('/advertiser');
          break;
        case 'admin':
          navigate('/admin');
          break;
        default:
          navigate('/login');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => onClose()}>
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0  bg-opacity-75 transition-opacity" onClick={(e) => e.stopPropagation()}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                User Details: {user.firstName} {user.lastName}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                ✕
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-4">
              <nav className="-mb-px flex space-x-8">
                {['profile', 'activity', 'websites', 'orders'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="max-h-96 overflow-y-auto">
              {activeTab === 'profile' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="mt-1 text-sm text-gray-900">{user.phoneNumber || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Role</label>
                      <p className="mt-1 text-sm text-gray-900 capitalize">{user.role}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {user.isSuspended ? 'Suspended' : 'Active'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email Verified</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {user.isEmailVerified ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Joined Date</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Websites</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {user.stats?.websites || 0}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Orders</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {user.stats?.orders || 0}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Account Balance</label>
                      <p className="mt-1 text-sm text-gray-900">
                        ${user.stats?.balance?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Total Earnings</label>
                      <p className="mt-1 text-sm text-gray-900">
                        ${user.stats?.totalEarnings?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>

                  {/* Role Switcher */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Switch Role</h4>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleRoleSwitch('publisher')}
                        disabled={user.role === 'publisher'}
                        className={`px-4 py-2 text-sm rounded-md ${
                          user.role === 'publisher'
                            ? 'bg-blue-100 text-blue-800 cursor-not-allowed'
                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        }`}
                      >
                        Publisher
                      </button>
                      <button
                        onClick={() => handleRoleSwitch('advertiser')}
                        disabled={user.role === 'advertiser'}
                        className={`px-4 py-2 text-sm rounded-md ${
                          user.role === 'advertiser'
                            ? 'bg-green-100 text-green-800 cursor-not-allowed'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        Advertiser
                      </button>
                      <button
                        onClick={() => handleRoleSwitch('admin')}
                        disabled={user.role === 'admin'}
                        className={`px-4 py-2 text-sm rounded-md ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800 cursor-not-allowed'
                            : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                        }`}
                      >
                        Admin
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'activity' && (
                <div>
                  <p className="text-gray-500">Activity logs will be displayed here</p>
                </div>
              )}

              {activeTab === 'websites' && user.role === 'publisher' && (
                <div>
                  <p className="text-gray-500">Website list will be displayed here</p>
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <p className="text-gray-500">Order history will be displayed here</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <div className="flex space-x-3">
              {user.isSuspended ? (
                <button
                  onClick={() => onAction(user._id, 'activate')}
                  disabled={loading}
                  className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 disabled:opacity-50 sm:text-sm"
                >
                  Activate User
                </button>
              ) : (
                <button
                  onClick={() => onAction(user._id, 'suspend', { reason: 'Admin action' })}
                  disabled={loading}
                  className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 disabled:opacity-50 sm:text-sm"
                >
                  Suspend User
                </button>
              )}
              
              <button
                onClick={onClose}
                className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;