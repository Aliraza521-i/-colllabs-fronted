import React, { useState } from "react";
import { Bell, Mail, User, LogOut, Globe, Wallet, Home } from "lucide-react";
import logo from "../../assets/images/logo.png";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";
import NotificationDropdown from "../../components/notifications/NotificationDropdown";

const Header = () => {
  const [showMsg, setShowMsg] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, switchRole } = useAuth();
  const { unreadCount } = useNotification();

  

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="w-full bg-[#0c0c0c] border-b-[#bff747] border text-white px-4 py-3 flex items-center justify-between relative shadow-lg">
      {/* Left: Logo - with margin to accommodate mobile menu button */}
      <div className="flex items-center gap-3 relative ml-12 lg:ml-0">
        <img src={logo} alt="logo" className="w-10 h-10 md:w-14 md:h-14 rounded-full border-2 border-[#bff747]" />

      
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 md:gap-6 relative">
        {/* Role Indicator - Hidden on mobile */}
        <div className="hidden sm:flex items-center gap-2 bg-[#bff747]/20 px-2 py-1 md:px-3 md:py-1 rounded-full border border-[#bff747]">
          <User className="w-3 h-3 md:w-4 md:h-4 text-[#bff747]" />
          <span className="text-xs md:text-sm font-medium capitalize text-[#bff747]">{user?.role || 'publisher'}</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <NotificationDropdown />
        </div>

        {/* Messages - Simplified for mobile */}
        <div className="relative">
          <button
            onClick={() => {
              setShowMsg(!showMsg);
              setShowProfile(false);
            }}
            className="relative"
          >
            <Mail className="w-5 h-5 md:w-6 md:h-6 cursor-pointer text-[#bff747] hover:text-white transition-colors" />
            {/* Badge for notifications - hidden on mobile for simplicity */}
            <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 flex h-3 w-3 md:h-4 md:w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 md:h-4 md:w-4 bg-red-500"></span>
            </span>
          </button>
          {showMsg && (
            <div className="absolute right-0 mt-2 w-48 md:w-64 bg-[#0c0c0c] text-white border border-[#bff747] shadow-lg rounded-lg p-2 md:p-3 z-50">
              <h3 className="font-semibold mb-2 text-[#bff747] text-sm md:text-base">Messages</h3>
              <p className="text-xs md:text-sm hover:bg-[#bff747]/20 p-2 rounded cursor-pointer">📩 Client: Please update my order</p>
              <p className="text-xs md:text-sm hover:bg-[#bff747]/20 p-2 rounded cursor-pointer">📩 Support: Your request approved</p>
            </div>
          )}
        </div>

        {/* Balance - Simplified for mobile */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-white font-medium text-sm">Balance:</span>
          <div className="border border-[#bff747] text-[#bff747] px-2 py-1 rounded-md bg-[#0c0c0c] cursor-pointer hover:bg-[#bff747] hover:text-[#0c0c0c] transition-colors">
            <span className="font-bold text-sm">153.71 USD</span>
          </div>
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfile(!showProfile);
              setShowMsg(false);
            }}
          >
            <img
              src="https://via.placeholder.com/40"
              alt="profile"
              className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-[#bff747] cursor-pointer"
            />
          </button>
          {showProfile && (
            <div className="absolute right-0 mt-2 w-40 md:w-48 bg-[#0c0c0c] text-white border border-[#bff747] shadow-lg rounded-lg p-2 md:p-3 z-50">
              <div className="flex items-center gap-2 mb-1 md:mb-2 cursor-pointer hover:bg-[#bff747]/20 p-2 rounded transition-colors">
                <User className="w-3 h-3 md:w-4 md:h-4 text-[#bff747]" /> 
                <span 
                  onClick={() => {
                    setShowProfile(false);
                    navigate('/publisher/profile');
                  }} 
                  className="text-xs md:text-sm"
                >
                  My Profile
                </span>
              </div>
              <div className="flex items-center gap-2 mb-1 md:mb-2 cursor-pointer hover:bg-[#bff747]/20 p-2 rounded transition-colors">
                <Home className="w-3 h-3 md:w-4 md:h-4 text-[#bff747]" /> 
                <span 
                  onClick={() => {
                    setShowProfile(false);
                    navigate('/publisher/home');
                  }} 
                  className="text-xs md:text-sm"
                >
                  My Websites
                </span>
              </div>
              <div className="flex items-center gap-2 mb-1 md:mb-2 cursor-pointer hover:bg-[#bff747]/20 p-2 rounded transition-colors">
                <Wallet className="w-3 h-3 md:w-4 md:h-4 text-[#bff747]" /> 
                <span 
                  onClick={() => {
                    setShowProfile(false);
                    navigate('/publisher/wallet');
                  }} 
                  className="text-xs md:text-sm"
                >
                  Wallet
                </span>
              </div>
           
              <div 
                className="flex items-center gap-2 text-red-500 cursor-pointer hover:bg-red-500/20 p-2 rounded transition-colors"
                onClick={handleLogout}
              >
                <LogOut className="w-3 h-3 md:w-4 md:h-4" /> 
                <span className="text-xs md:text-sm">Logout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;