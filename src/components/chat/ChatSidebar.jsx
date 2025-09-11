import React, { useState, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { chatAPI, adminAPI } from '../../services/api';
import {
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

const ChatSidebar = ({ onChatSelect, activeChatId }) => {
  const { chats, setChats, unreadCounts, isUserOnline } = useChat();
  const { user, isPublisher, isAdvertiser, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setLoading(true);
      let response;
      
      // Use adminAPI for admin users, chatAPI for others
      if (isAdmin()) {
        response = await adminAPI.getAllChats();
      } else {
        response = await chatAPI.getChats();
      }
      
      if (response.data && response.data.ok) {
        setChats(response.data.data);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.participants.some(p => {
      const firstName = p.userId?.firstName || '';
      const lastName = p.userId?.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();
      return fullName.toLowerCase().includes(searchQuery.toLowerCase());
    }) || (chat.lastMessage && chat.lastMessage.content && chat.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter = selectedFilter === 'all' || 
      (selectedFilter === 'unread' && unreadCounts[chat._id] > 0) ||
      (selectedFilter === 'orders' && chat.type === 'order') ||
      (selectedFilter === 'support' && chat.type === 'support');

    return matchesSearch && matchesFilter;
  });

  const getChatDisplayName = (chat) => {
    if (!chat || !chat.participants || !user) return 'Chat';
    
    const otherParticipant = chat.participants.find(p => p.userId?._id !== user._id);
    if (otherParticipant && otherParticipant.userId) {
      const firstName = otherParticipant.userId.firstName || '';
      const lastName = otherParticipant.userId.lastName || '';
      const name = `${firstName} ${lastName}`.trim();
      return name || 'User';
    }
    
    const currentUserParticipant = chat.participants.find(p => p.userId?._id === user._id);
    if (currentUserParticipant && currentUserParticipant.userId) {
      const firstName = currentUserParticipant.userId.firstName || '';
      const lastName = currentUserParticipant.userId.lastName || '';
      const name = `${firstName} ${lastName}`.trim();
      return name || 'User';
    }
    
    return 'Chat';
  };

const getChatSubtitle = (chat) => {
  if (chat.type === 'order') {
    return 'Order Discussion';
  }
  
  const otherParticipant = chat.participants.find(p => p.userId?._id !== user._id);
  if (otherParticipant) {
    return otherParticipant.role || 'User';
  }
  
  return 'Conversation';
};

const getLastMessagePreview = (message) => {
  if (!message) return 'No messages yet';
  
  if (message.type === 'file') {
    return `📎 ${message.attachments?.[0]?.filename || 'File'}`;
  }
  
  return message.content?.length > 50 
    ? `${message.content.substring(0, 50)}...` 
    : message.content;
};

const getChatStatusIcon = (chat) => {
  if (chat.status === 'active') {
    return <CheckCircleIcon className="h-4 w-4 text-[#bff747]" />;
  }
  if (chat.status === 'resolved') {
    return <CheckCircleIcon className="h-4 w-4 text-gray-400" />;
  }
  if (chat.hasIssues) {
    return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />;
  }
  return null;
};

const getUserRoleSpecificChats = () => {
  if (isAdmin()) {
    return filteredChats;
  } else if (isPublisher()) {
    return filteredChats.filter(chat => 
      chat.participants.some(p => p.role === 'publisher') || 
      chat.type === 'order'
    );
  } else if (isAdvertiser()) {
    return filteredChats.filter(chat => 
      chat.participants.some(p => p.role === 'advertiser') || 
      chat.type === 'order'
    );
  }
  return filteredChats;
};

  if (loading) {
    return (
      <div className="w-80 bg-[#0c0c0c] border-r border-[#bff747]/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#bff747]"></div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-[#0c0c0c] border-r border-[#bff747]/30 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#bff747]/30">
        <div className="flex items-center space-x-3">
          <ChatBubbleLeftRightIcon className="h-6 w-6 text-[#bff747]" />
          <h2 className="text-lg font-semibold text-[#bff747]">Chats</h2>
        </div>
        
        {/* Search */}
        <div className="mt-3 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 bg-[#1a1a1a] border border-[#bff747]/30 rounded-lg leading-5 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#bff747] focus:border-[#bff747] sm:text-sm text-white"
          />
        </div>
        
        {/* Filters */}
        <div className="mt-3 flex space-x-1">
          {[
            { key: 'all', label: 'All' },
            { key: 'unread', label: 'Unread' },
            { key: 'orders', label: 'Orders' },
            { key: 'support', label: 'Support' }
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setSelectedFilter(filter.key)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                selectedFilter === filter.key
                  ? 'bg-[#bff747] text-[#0c0c0c]'
                  : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#2a2a2a]'
              }`}
            >
              {filter.label}
              {filter.key === 'unread' && Object.values(unreadCounts).reduce((a, b) => a + b, 0) > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1">
                  {Object.values(unreadCounts).reduce((a, b) => a + b, 0)}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {getUserRoleSpecificChats().length === 0 ? (
          <div className="p-6 text-center">
            <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-[#bff747]/30" />
            <p className="mt-2 text-sm text-gray-400">
              {searchQuery ? 'No chats found' : 'No chats yet'}
            </p>
          </div>
        ) : (
          getUserRoleSpecificChats().map((chat) => {
            const isActive = activeChatId === chat._id;
            const unreadCount = unreadCounts[chat._id] || 0;
            
            return (
              <div
                key={chat._id}
                onClick={() => onChatSelect(chat)}
                className={`p-3 border-b border-[#bff747]/10 cursor-pointer hover:bg-[#1a1a1a] transition-colors ${
                  isActive ? 'bg-[#2a2a2a]' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative flex-shrink-0">
                    <UserCircleIcon className="h-12 w-12 text-[#bff747]" />
                    {chat.participants.some(p => p.userId?._id !== user._id) && isUserOnline(chat.participants.find(p => p.userId?._id !== user._id).userId._id) && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 bg-[#bff747] rounded-full border-2 border-[#0c0c0c]"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium text-[#bff747] truncate">
                        {getChatDisplayName(chat)}
                      </p>
                      {chat.lastMessage?.createdAt && (
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {formatDistanceToNow(new Date(chat.lastMessage.createdAt), { addSuffix: false })}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-400 mt-1 truncate">
                      {getChatSubtitle(chat)}
                    </p>
                    
                    <div className="flex items-center justify-between mt-1">
                      {chat.lastMessage && (
                        <p className="text-sm text-gray-300 truncate">
                          {getLastMessagePreview(chat.lastMessage)}
                        </p>
                      )}
                      {unreadCount > 0 && (
                        <span className="bg-[#bff747] text-[#0c0c0c] text-xs rounded-full px-2 py-1 min-w-5 text-center ml-2 flex-shrink-0">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {/* Footer with stats */}
      <div className="p-4 border-t border-[#bff747]/30 bg-[#1a1a1a]">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{getUserRoleSpecificChats().length} chats</span>
          <div className="flex items-center space-x-1">
            <ClockIcon className="h-3 w-3" />
            <span>Updated: {formatDistanceToNow(new Date(), { addSuffix: true })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;