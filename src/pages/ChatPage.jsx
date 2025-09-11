import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI } from '../services/api';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatInterface from '../components/chat/ChatInterface';
import {
  ChatBubbleLeftRightIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const ChatPage = () => {
  const { chatId: urlChatId } = useParams();
  const { user, token } = useAuth();
  const { isConnected, connectSocket, chats, setChats, joinChat, activeChat, loadChats } = useChat();
  const [selectedChat, setSelectedChat] = useState(null);
  const [showMobileInterface, setShowMobileInterface] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chatSelectionAttempted, setChatSelectionAttempted] = useState(false);
  const navigate = useNavigate();

  const fetchAllChats = useCallback(async () => {
    try {
      setLoading(true);
      // For admin, we need to load all chats using adminAPI
      const response = await adminAPI.getAllChats();
      if (response.data && response.data.ok) {
        setChats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch all chats:', error);
    } finally {
      setLoading(false);
    }
  }, [setChats]); // Add setChats to dependencies

  useEffect(() => {
    // Ensure socket connection when component mounts
    if (!isConnected && user && token) {
      connectSocket();
    }
    
    // If user is admin, fetch all chats
    if (user && user.role === 'admin') {
      fetchAllChats();
    } else if (user && token) {
      // For non-admin users, use the context's loadChats
      loadChats();
    }
  }, [isConnected, connectSocket, user, token, fetchAllChats, loadChats]); // Add loadChats to dependencies

  // Effect to load chats if not loaded yet when URL param is available
  useEffect(() => {
    if (urlChatId && chats.length === 0 && user && token) {
      if (user.role === 'admin') {
        fetchAllChats();
      } else {
        loadChats();
      }
    }
  }, [urlChatId, chats.length, user, token, loadChats, fetchAllChats]);

  // Effect to handle direct navigation to a chat
  useEffect(() => {
    if (urlChatId && chats.length > 0 && !selectedChat && !chatSelectionAttempted) {
      // Find the chat with the matching ID
      const chatToSelect = chats.find(chat => chat._id === urlChatId);
      if (chatToSelect) {
        handleChatSelect(chatToSelect);
        setChatSelectionAttempted(true);
      } else {
        // If chat not found, it might be that the chats haven't been fully loaded yet
        // Reset the attempt flag so we can try again
        setChatSelectionAttempted(false);
      }
    }
  }, [urlChatId, chats, selectedChat, chatSelectionAttempted]);

  // Effect to automatically join chat when selected
  useEffect(() => {
    if (selectedChat && selectedChat._id !== activeChat) {
      joinChat(selectedChat._id);
    }
  }, [selectedChat, activeChat, joinChat]);

  // Reset chat selection attempt when URL changes
  useEffect(() => {
    setChatSelectionAttempted(false);
  }, [urlChatId]);

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    setShowMobileInterface(true);
    
    // Update URL to reflect the selected chat
    if (user && user.role === 'admin') {
      navigate(`/admin/chats/${chat._id}`);
    } else if (user && user.role === 'publisher') {
      navigate(`/publisher/chat/${chat._id}`);
    } else if (user && user.role === 'advertiser') {
      navigate(`/advertiser/chat/${chat._id}`);
    }
    
    // Join the chat room will be handled by the useEffect above
  };

  const handleBackToList = () => {
    setSelectedChat(null);
    setShowMobileInterface(false);
    
    // Update URL to remove chat ID
    if (user && user.role === 'admin') {
      navigate(`/admin/chats`);
    } else if (user && user.role === 'publisher') {
      navigate(`/publisher/chat`);
    } else if (user && user.role === 'advertiser') {
      navigate(`/advertiser/chat`);
    }
  };

  const ConnectionStatus = () => (
    <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
      isConnected ? 'bg-[#bff747]/20 text-[#bff747] border border-[#bff747]/30' : 'bg-red-900/30 text-red-400 border border-red-500/30'
    }`}>
      <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-[#bff747]' : 'bg-red-500'}`}></div>
      <span className="text-sm font-medium">
        {isConnected ? 'Connected' : 'Reconnecting...'}
      </span>
      {!isConnected && (
        <ExclamationCircleIcon className="h-4 w-4" />
      )}
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center">
        <div className="text-center">
          <ExclamationCircleIcon className="mx-auto h-12 w-12 text-[#bff747]" />
          <h3 className="mt-2 text-sm font-medium text-[#bff747]">Authentication Required</h3>
          <p className="mt-1 text-sm text-gray-400">Please log in to access the chat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0c0c0c] flex overflow-hidden">
      <style>{`
        .scrollbar-hidden::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hidden {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-visible::-webkit-scrollbar {
          width: 8px;
        }
        .scrollbar-visible::-webkit-scrollbar-track {
          background: #1a1a1a;
          border-radius: 4px;
        }
        .scrollbar-visible::-webkit-scrollbar-thumb {
          background: #bff747;
          border-radius: 4px;
        }
        .scrollbar-visible::-webkit-scrollbar-thumb:hover {
          background: #a0d82a;
        }
      `}</style>
      {/* Desktop Layout */}
      <div className="hidden lg:flex w-full">
        {/* Chat Sidebar */}
        <ChatSidebar 
          onChatSelect={handleChatSelect}
          activeChatId={selectedChat?._id}
        />
        
        {/* Chat Interface */}
        <div className="flex-1 flex flex-col h-full">
          {/* Header with connection status */}
          <div className="bg-[#0c0c0c] border-b border-[#bff747]/30 p-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-[#bff747]">Messages</h1>
                <p className="text-sm text-gray-400">
                  {selectedChat 
                    ? `${selectedChat.type === 'order' ? 'Order Discussion' : 'Support Chat'}`
                    : 'Select a conversation to start messaging'
                  }
                </p>
              </div>
              <ConnectionStatus />
            </div>
          </div>
          
          {selectedChat ? (
            <div className="flex-1 min-h-0">
              <ChatInterface 
                chatId={selectedChat._id}
                chatType={selectedChat.type}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-[#1a1a1a]">
              <div className="text-center">
                <ChatBubbleLeftRightIcon className="mx-auto h-16 w-16 text-[#bff747]/30" />
                <h3 className="mt-4 text-lg font-medium text-[#bff747]">No conversation selected</h3>
                <p className="mt-2 text-sm text-gray-400 max-w-sm">
                  {user.role === 'admin' 
                    ? 'Choose a conversation from the sidebar to monitor communications.'
                    : 'Choose a conversation from the sidebar to start messaging.'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden w-full">
        {!showMobileInterface ? (
          <div className="h-full">
            {/* Mobile Header */}
            <div className="bg-[#0c0c0c] border-b border-[#bff747]/30 p-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-[#bff747]">Messages</h1>
                <ConnectionStatus />
              </div>
            </div>
            
            {/* Mobile Chat List */}
            <div className="h-full">
              <ChatSidebar 
                onChatSelect={handleChatSelect}
                activeChatId={selectedChat?._id}
              />
            </div>
          </div>
        ) : (
          <div className="h-full">
            {/* Mobile Chat Interface */}
            <ChatInterface 
              chatId={selectedChat._id}
              chatType={selectedChat.type}
              onClose={handleBackToList}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;