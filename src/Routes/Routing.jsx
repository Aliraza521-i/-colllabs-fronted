import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import PublisherLayout from "../layouts/PublisherLayout";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Websites from "../pages/publisher/websites/Websites";
import WebsiteDetails from "../pages/publisher/websites/WebsiteDetails";
import Sales from "../pages/publisher/sales/Sales";
// import ReceivedMyOwnArticle from "../pages/publisher/sales/ReceivedMyOwnArticle";
import Wallet from "../pages/publisher/wallet/Wallet";
import Contact from "../pages/publisher/contact/Contact";
import Home from "../pages/publisher/home/Home";
import ConfirmOnship from "../pages/publisher/AddWebsite/confirmOS/ConfirmOnship";
import DescriptionPricePage from "../pages/publisher/AddWebsite/descriptionPricePage/DescriptionPricePage";
import EarnSuccessPage from "../pages/publisher/AddWebsite/earnSuccessPage/EarnSuccessPage";
import Addwebsite from "../pages/publisher/AddWebsite/Addwebsite";
import VerificationSuccess from "../pages/publisher/AddWebsite/confirmOS/VerificationSuccess";
import VerificationError from "../pages/publisher/AddWebsite/confirmOS/VerificationError";
import Profile from "../pages/publisher/Profile";
// import ChooseOwnArticle from "../pages/publisher/ChooseOwnArticle";
import ChatPage from "../pages/ChatPage";
import Messages from "../pages/publisher/Message/Messages";
import ChooseMyOwnArticle from "../pages/advertiser/components/OrderManagement/ChooseMyOwnArticle";
import PublisherChooseOwnArticle from "../pages/publisher/sales/Article";
import DepositPage from "../pages/advertiser/components/WalletManagement/DepositPage"; // Add this import

// Admin Dashboard
import AdminDashboard from "../pages/admin/AdminDashboard";

// Advertiser Dashboard
import AdvertiserDashboard from "../pages/advertiser/AdvertiserDashboard";

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    switch (user.role) {
      case "publisher":
        return <Navigate to="/publisher" replace />;
      case "advertiser":
        return <Navigate to="/advertiser" replace />;
      case "admin":
        return <Navigate to="/admin" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return children;
};

// Public Route Component (redirects authenticated users)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated() && user) {
    // Redirect to appropriate dashboard
    switch (user.role) {
      case "publisher":
        return <Navigate to="/publisher" replace />;
      case "advertiser":
        return <Navigate to="/advertiser" replace />;
      case "admin":
        return <Navigate to="/admin" replace />;
      default:
        return <Navigate to="/publisher" replace />;
    }
  }

  return children;
};

const Routing = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />

        {/* Verification Routes (public but with parameters) */}
        <Route path="/verification-success" element={<VerificationSuccess />} />
        <Route path="/verification-error" element={<VerificationError />} />

        {/* Publisher Routes - Now Public */}
        <Route
          path="/publisher/*"
          element={<PublisherLayout />}
        >
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="websites" element={<Websites />} />
          <Route path="website-details" element={<WebsiteDetails />} />
          <Route path="addweb" element={<Addwebsite />} />
          <Route path="sales" element={<Sales />} />
          {/* Re-added the article route as a separate page */}
          <Route path="sales/article" element={<PublisherChooseOwnArticle />} />
          {/* <Route path="my-own-article" element={<ReceivedMyOwnArticle />} /> */}
          <Route path="wallet" element={<Wallet />} />
          <Route path="contact" element={<Contact />} />
          <Route path="confirmOwnership" element={<ConfirmOnship />} />
          <Route path="descriptionprice" element={<DescriptionPricePage />} />
          <Route path="earn" element={<EarnSuccessPage />} />
          <Route path="profile" element={<Profile />} />
          {/* <Route path="choose-own-article" element={<ChooseOwnArticle />} /> */}
          {/* Update messages route to handle chatId parameter */}
          <Route path="messages" element={<Messages />} />
          <Route path="messages/:chatId" element={<Messages />} />
          {/* Add chat route */}
          <Route path="chat" element={<ChatPage />} />
          <Route path="chat/:chatId" element={<ChatPage />} />
        </Route>

        {/* Advertiser Routes - Now Public */}
        <Route
          path="/advertiser/*"
          element={<AdvertiserDashboard />}
        >
          {/* Add chat routes for advertisers */}
          <Route path="chat" element={<ChatPage />} />
          <Route path="chat/:chatId" element={<ChatPage />} />
          <Route path="write-own-article/:itemId" element={<ChooseMyOwnArticle />} />
          <Route path="deposit" element={<DepositPage />} /> {/* Add this route */}
        </Route>

        {/* Admin Routes - Now Public */}
        <Route
          path="/admin/*"
          element={<AdminDashboard />}
        >
          {/* Add chat routes for admin */}
          <Route path="chat" element={<ChatPage />} />
          <Route path="chat/:chatId" element={<ChatPage />} />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Routing;