import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import AdvertiserSidebar from './components/AdvertiserSidebar';
import AdvertiserHeader from './components/AdvertiserHeader';
import AdvertiserDashboardHome from './components/AdvertiserDashboardHome';
import WebsiteBrowsing from './components/WebsiteBrowsing';
import OrderManagement from './components/OrderManagement';
import OrderPlacement from './components/OrderPlacement';
import AdvertiserAnalytics from './components/AdvertiserAnalytics';
import WalletManagement from './components/WalletManagement';
import FavoriteWebsites from './components/FavoriteWebsites';
import WebsiteDetailsView from './components/WebsiteDetailsView';
import OrderDetailsView from './components/OrderDetailsView';
import ProfileSettings from './components/ProfileSettings';
import QualityManagement from './components/QualityManagement';
import QualityCheckDetail from './components/QualityCheckDetail';
import ProjectsDashboard from './components/ProjectsDashboard';
import ProjectsDetails from './components/ProjectsDetails';
import { useAuth } from '../../contexts/AuthContext';
import { advertiserAPI, walletAPI } from '../../services/api';
import ChatSidebar from '../../components/chat/ChatSidebar';
import ChatInterface from '../../components/chat/ChatInterface';
import { useChat } from '../../contexts/ChatContext';
import BulkOrderManagement from './components/BulkOrderManagement';

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

// Messages Component
const Messages = () => {
  const [activeChat, setActiveChat] = useState(null);
  const { chats, loading, loadChats } = useChat();
  const [searchParams] = useSearchParams();
  const [initialChatLoaded, setInitialChatLoaded] = useState(false);

  useEffect(() => {
    // Load chats if not already loaded
    if (!loading && (!chats || chats.length === 0) && !initialChatLoaded) {
      loadChats();
      setInitialChatLoaded(true);
    }
  }, [loading, chats, initialChatLoaded, loadChats]);

  useEffect(() => {
    // Check if there's a chatId in the URL parameters
    const chatId = searchParams.get('chatId');
    if (chatId && chats && chats.length > 0) {
      const chatToSelect = chats.find(chat => chat._id === chatId);
      if (chatToSelect) {
        setActiveChat(chatToSelect);
      }
    }
  }, [searchParams, chats]);

  const handleChatSelect = (chat) => {
    setActiveChat(chat);
  };

  return (
    <div className="bg-[#1a1a1a] rounded-lg border border-[#bff747]/30 p-6">
      <h2 className="text-2xl font-bold text-[#bff747] mb-6">Messages</h2>
      
      <div className="flex h-[calc(100vh-200px)] border border-[#bff747]/30 rounded-lg overflow-hidden">
        {/* Chat Sidebar */}
        <div className="w-1/3 border-r border-[#bff747]/30">
          <ChatSidebar 
            onChatSelect={handleChatSelect} 
            activeChatId={activeChat?._id}
          />
        </div>
        
        {/* Chat Interface */}
        <div className="flex-1">
          {activeChat ? (
            <ChatInterface 
              chatId={activeChat._id} 
              chatType={activeChat.type}
              onClose={() => setActiveChat(null)}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-[#0c0c0c]">
              <div className="text-center">
                <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-[#bff747]/30" />
                <h3 className="mt-2 text-sm font-medium text-[#bff747]">No conversation selected</h3>
                <p className="mt-1 text-sm text-gray-400">
                  Select a conversation from the sidebar to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
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

  useEffect(() => {
    // Removed role check to make dashboard publicly accessible
    fetchDashboardData();
    fetchWalletBalance();
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
        setWalletBalance(response.data.data.balance);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch wallet balance');
      }
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
      setError(prevError => prevError ? `${prevError} Wallet balance could not be loaded.` : 'Failed to load wallet balance. Please try again later.');
      setWalletBalance(0);
    }
  };

  // Removed the redirect that was sending users to login
  // Dashboard is now publicly accessible

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

  // Create a wrapper component for ProjectsDetails to avoid potential import issues
  const ProjectsDetailsWrapper = () => {
    // Import the component dynamically to avoid circular dependencies
    return <ProjectsDetails />;
  };

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
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#0c0c0c] p-6">
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
              path="order/:websiteId" 
              element={<OrderPlacement />} 
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
              path="bulk-orders" 
              element={<BulkOrderManagement />} 
            />
            <Route 
              path="messages" 
              element={<Messages />} 
            />
            <Route 
              path="analytics" 
              element={<AdvertiserAnalytics />} 
            />
            <Route 
              path="favorites" 
              element={<FavoriteWebsites />} 
            />
            <Route 
              path="wallet" 
              element={<WalletManagement onBalanceUpdate={fetchWalletBalance} />} 
            />
            <Route 
              path="quality" 
              element={<QualityManagement />} 
            />
            <Route 
              path="quality/:qualityCheckId" 
              element={<QualityCheckDetail />} 
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
            {/* Added Projects Details route with wrapper */}
            <Route 
              path="projects/details" 
              element={<ProjectsDetailsWrapper />} 
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

export default AdvertiserDashboard;