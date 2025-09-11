import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';
import AdminDashboardHome from './components/AdminDashboardHome';
import UserManagement from './components/UserManagement';
import WebsiteApproval from './components/WebsiteApproval';
import AllWebsites from './components/AllWebsites';
import OrderManagement from './components/OrderManagement';
import FinancialManagement from './components/FinancialManagement';
import Analytics from './components/Analytics';
import SystemSettings from './components/SystemSettings';
import SupportTickets from './components/SupportTickets';
import { useAuth } from '../../contexts/AuthContext';
import { adminAPI } from '../../services/api';
import ChatPage from '../../pages/ChatPage';

const AdminDashboard = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchDashboardData = useCallback(async () => {
    // Only fetch dashboard data if user is authenticated and is admin
    if (!isAuthenticated() || !isAdmin()) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getDashboard();
      if (response.data && response.data.ok) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data');
      // Still set loading to false even if fetch fails
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  const fetchNotifications = useCallback(async () => {
    // Only fetch notifications if user is authenticated and is admin
    if (!isAuthenticated() || !isAdmin()) {
      setNotifications([]);
      return;
    }
    
    try {
      const response = await adminAPI.getNotifications();
      if (response.data && response.data.ok) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
    }
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    fetchDashboardData();
    // Only fetch notifications if user is authenticated and is admin
    if (isAuthenticated() && isAdmin()) {
      fetchNotifications();
    } else {
      // Set loading to false immediately if not authenticated or not admin
      setLoading(false);
      setNotifications([]);
    }
  }, [fetchDashboardData, fetchNotifications, isAuthenticated, isAdmin, retryCount]);

  const handleRetry = () => {
    // Limit retries to prevent infinite loops
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
    } else {
      setError('Failed to load dashboard after multiple attempts. Please try again later.');
    }
  };

  // Redirect to login if user is not authenticated or not admin
  if (!isAuthenticated() || !isAdmin()) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          {retryCount < 3 ? (
            <button
              onClick={handleRetry}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          ) : (
            <p className="text-gray-500">Please refresh the page or try again later.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <AdminSidebar 
        open={sidebarOpen} 
        setOpen={setSidebarOpen}
        notifications={notifications}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <AdminHeader 
          setSidebarOpen={setSidebarOpen}
          user={user}
          notifications={notifications}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6 h-full">
          <Routes>
            <Route 
              index 
              element={
                <AdminDashboardHome 
                  data={dashboardData}
                  refreshData={fetchDashboardData}
                />
              } 
            />
            <Route 
              path="users" 
              element={<UserManagement />} 
            />
            <Route 
              path="websites" 
              element={<WebsiteApproval />} 
            />
            <Route 
              path="all-websites" 
              element={<AllWebsites />} 
            />
            <Route 
              path="orders" 
              element={<OrderManagement />} 
            />
            <Route 
              path="finance" 
              element={<FinancialManagement />} 
            />
            <Route 
              path="chats/*" 
              element={<ChatPage />} 
            />
            <Route 
              path="analytics" 
              element={<Analytics />} 
            />
            <Route 
              path="settings" 
              element={<SystemSettings />} 
            />
            <Route 
              path="support" 
              element={<SupportTickets />} 
            />
            {/* Catch-all route to render dashboard home for unmatched paths */}
            <Route 
              path="*" 
              element={<AdminDashboardHome data={dashboardData} refreshData={fetchDashboardData} />} 
            />
          </Routes>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;