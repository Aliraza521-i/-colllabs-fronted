import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useParams, useLocation, useNavigate } from 'react-router-dom';
import AdvertiserSidebar from './components/AdvertiserSidebar';
import AdvertiserHeader from './components/AdvertiserHeader';
import AdvertiserDashboardHome from './components/AdvertiserDashboardHome';
import WebsiteBrowsing from './components/BrowseWebsite/WebsiteBrowsing';
import OrderManagement from './components/OrderManagement/OrderManagement';
import WalletManagement from './components/WalletManagement/WalletManagement';
import WebsiteDetailsView from './components/BrowseWebsite/WebsiteDetailsView';
import OrderDetailsView from './components/OrderManagement/OrderDetailsView';
import ProfileSettings from './components/ProfileSettings';
import ProjectsDashboard from './components/ProjectManagement/ProjectsDashboard';
import ProjectsDetails from './components/ProjectManagement/ProjectsDetails';
import CreateProject from './components/ProjectManagement/CreateProject';
import ShoppingCart from './components/ShoppingCart/ShoppingCart';
import ChooseMyOwnArticle from './components/ShoppingCart/ChooseMyOwnArticle';
import DepositPage from './components/WalletManagement/DepositPage';
import { Messages } from './components/ChatManagement'; // Import Messages from ChatManagement
import { useAuth } from '../../contexts/AuthContext';
import { advertiserAPI, walletAPI } from '../../services/api';

// Website Details Component
const WebsiteDetails = () => {
  const { websiteId } = useParams();
  const [website, setWebsite] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWebsiteDetails();
  }, [websiteId]);

  const fetchWebsiteDetails = async () => {
    try {
      const response = await advertiserAPI.getWebsiteDetails(websiteId);
      if (response.data && response.data.ok) {
        setWebsite(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch website details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#bff747]"></div>
    </div>;
  }

  if (!website) {
    return <div className="text-center py-12">
      <h3 className="text-lg font-medium text-[#bff747]">Website not found</h3>
    </div>;
  }

  return (
    <WebsiteDetailsView website={website} />
  );
};

// Order Details Component
const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await advertiserAPI.getOrderDetails(orderId);
      if (response.data) {
        setOrder(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#bff747]"></div>
    </div>;
  }

  if (!order) {
    return <div className="text-center py-12">
      <h3 className="text-lg font-medium text-[#bff747]">Order not found</h3>
    </div>;
  }

  return (
    <OrderDetailsView order={order} onUpdate={fetchOrderDetails} />
  );
};

const AdvertiserDashboard = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Removed role check to make dashboard publicly accessible
    fetchDashboardData();
    fetchWalletBalance();
  }, []);

  // Add interval to periodically refresh wallet balance
  useEffect(() => {
    const interval = setInterval(() => {
      fetchWalletBalance();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await advertiserAPI.getDashboard();
      if (response.data && response.data.ok) {
        setDashboardData(response.data.data);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data. Please try again later.');
      // Still set loading to false even if fetch fails
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const response = await walletAPI.getBalance();
      if (response.data && response.data.ok) {
        setWalletBalance(response.data.data.wallet.balance);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch wallet balance');
      }
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
      setError(prevError => prevError ? `${prevError} Wallet balance could not be loaded.` : 'Failed to load wallet balance. Please try again later.');
      setWalletBalance(0);
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#bff747]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center">
        <div className="bg-[#1a1a1a] rounded-lg border border-[#bff747]/30 p-6 max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-900/30">
              <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="mt-2 text-lg font-medium text-[#bff747]">Error Loading Dashboard</h3>
            <p className="mt-1 text-sm text-gray-400">{error}</p>
            <div className="mt-6">
              <button
                type="button"
                onClick={fetchDashboardData}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-[#0c0c0c] bg-[#bff747] hover:bg-[#a8e035] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#bff747]"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0c0c] flex">
      {/* Sidebar */}
      <AdvertiserSidebar 
        open={sidebarOpen} 
        setOpen={setSidebarOpen}
        walletBalance={walletBalance}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <AdvertiserHeader 
          setSidebarOpen={setSidebarOpen}
          user={user}
          walletBalance={walletBalance}
          onWalletUpdate={fetchWalletBalance}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#0c0c0c]">
          <div>
            <Routes>
              <Route 
                index 
                element={
                  <AdvertiserDashboardHome 
                    data={dashboardData}
                    refreshData={fetchDashboardData}
                  />
                } 
              />
              <Route 
                path="browse" 
                element={<WebsiteBrowsing />} 
              />
              <Route 
                path="browse/:websiteId" 
                element={<WebsiteDetails />} 
              />
              <Route 
                path="orders" 
                element={<OrderManagement />} 
              />
              <Route 
                path="orders/:orderId" 
                element={<OrderDetails />} 
              />
              <Route 
                path="messages" 
                element={<Messages />} 
              />
              {/* Add route for messages with chatId parameter */}
              <Route 
                path="messages/:chatId" 
                element={<Messages />} 
              />


              <Route 
                path="wallet" 
                element={<WalletManagement onBalanceUpdate={fetchWalletBalance} />} 
              />

              <Route 
                path="profile" 
                element={<ProfileSettings />} 
              />
              {/* Added Projects route */}
              <Route 
                path="projects" 
                element={<ProjectsDashboard />} 
              />
              {/* Updated Projects Details route to use ID parameter */}
              <Route 
                path="projects/:id" 
                element={<ProjectsDetails />} 
              />
              {/* Keep the general details route for backward compatibility */}
              <Route 
                path="projects/details" 
                element={<ProjectsDetails />} 
              />
              {/* Added Create Project route */}
              <Route 
                path="projects/create" 
                element={<CreateProject />} 
              />
              {/* Added Shopping Cart route */}
              <Route 
                path="cart" 
                element={<ShoppingCart />} 
              />
              <Route 
                path="write-own-article/:itemId" 
                element={<ChooseMyOwnArticle />} 
              />
              {/* Added Deposit route */}
              <Route 
                path="deposit" 
                element={<DepositPage />} 
              />
            </Routes>
          </div>
          
          {/* Footer */}
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

export default AdvertiserDashboard;