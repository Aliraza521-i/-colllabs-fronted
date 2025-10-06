import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { useChat } from '../../../contexts/ChatContext';
import { useAuth } from '../../../contexts/AuthContext';
import ChatSidebar from '../../../components/chat/ChatSidebar';
import ChatInterface from '../../../components/chat/ChatInterface';
import {
  ChatBubbleLeftRightIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const Messages = () => {
  const { user } = useAuth();
  const [activeChat, setActiveChat] = useState(null);
  const { chats, loading, loadChats, joinChat, isConnected } = useChat();
  const [searchParams] = useSearchParams();
  const { chatId: urlChatId } = useParams();
  const [initialChatLoaded, setInitialChatLoaded] = useState(false);
  const [chatSelectionAttempted, setChatSelectionAttempted] = useState(false);
  const [showMobileInterface, setShowMobileInterface] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load chats if not already loaded
    if (!loading && (!chats || chats.length === 0) && !initialChatLoaded) {
      loadChats();
      setInitialChatLoaded(true);
    }
  }, [loading, chats, initialChatLoaded, loadChats]);

  // Effect to load chats if not loaded yet when URL param is available
  useEffect(() => {
    const chatId = urlChatId || searchParams.get('chatId');
    if (chatId && (!chats || chats.length === 0) && !loading && !initialChatLoaded) {
      loadChats();
      setInitialChatLoaded(true);
    }
  }, [urlChatId, searchParams, chats, loading, initialChatLoaded, loadChats]);

  // Effect to handle chat selection when chats are loaded after URL param is available
  useEffect(() => {
    // Check if there's a chatId in the URL parameters (route params have priority)
    const chatId = urlChatId || searchParams.get('chatId');
    if (chatId && chats && chats.length > 0 && !activeChat && !chatSelectionAttempted) {
      const chatToSelect = chats.find(chat => chat._id === chatId);
      if (chatToSelect) {
        handleChatSelect(chatToSelect);
        setChatSelectionAttempted(true);
      } else {
        // If chat not found, it might be that the chats haven't been fully loaded yet
        // Reset the attempt flag so we can try again
        setChatSelectionAttempted(false);
      }
    }
  }, [chats, urlChatId, searchParams, activeChat, chatSelectionAttempted]);

  // Effect to automatically join chat when selected
  useEffect(() => {
    if (activeChat) {
      joinChat(activeChat._id);
    }
  }, [activeChat, joinChat]);

  const handleChatSelect = (chat) => {
    setActiveChat(chat);
    setShowMobileInterface(true);
    
    // Update URL to reflect the selected chat
    if (chat._id) {
      navigate(`/publisher/chat/${chat._id}`);
    }
  };

  const handleBackToList = () => {
    setActiveChat(null);
    setShowMobileInterface(false);
    
    // Update URL to remove chat ID
    navigate(`/publisher/chat`);
  };

  // Reset chat selection attempt when URL changes
  useEffect(() => {
    setChatSelectionAttempted(false);
  }, [urlChatId, searchParams]);

  const ConnectionStatus = () => (
    <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
      isConnected ? 'bg-green-900/30 text-green-400 border border-green-500/30' : 'bg-red-900/30 text-red-400 border border-red-500/30'
    }`}>
      <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
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
          activeChatId={activeChat?._id}
        />
        
        {/* Chat Interface */}
        <div className="flex-1 flex flex-col h-full">
          {/* Header with connection status */}
          <div className="bg-[#0c0c0c] border-b border-[#bff747]/30 p-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-[#bff747]">Messages</h1>
                <p className="text-sm text-gray-400">
                  {activeChat 
                    ? `${activeChat.type === 'order' ? 'Order Discussion' : 'Support Chat'}`
                    : 'Select a conversation to start messaging'
                  }
                </p>
              </div>
              <ConnectionStatus />
            </div>
          </div>
          
          {activeChat ? (
            <div className="flex-1 min-h-0">
              <ChatInterface 
                chatId={activeChat._id}
                chatType={activeChat.type}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ChatBubbleLeftRightIcon className="mx-auto h-16 w-16 text-[#bff747]/30" />
                <h3 className="mt-4 text-lg font-medium text-[#bff747]">No conversation selected</h3>
                <p className="mt-2 text-sm text-gray-400 max-w-sm">
                  Choose a conversation from the sidebar to start messaging with publishers, advertisers, or support team.
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
                activeChatId={activeChat?._id}
              />
            </div>
          </div>
        ) : (
          <div className="h-full">
            {/* Mobile Chat Interface */}
            <ChatInterface 
              chatId={activeChat._id}
              chatType={activeChat.type}
              onClose={handleBackToList}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;