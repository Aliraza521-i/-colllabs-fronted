import React, { useState, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { chatAPI, adminAPI } from '../../services/api';
import {
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

const ChatSidebar = ({ onChatSelect, activeChatId }) => {
  const { chats, setChats, unreadCounts, isUserOnline, user, highlightedChats, setHighlightedChats } = useChat();
  const { isPublisher, isAdvertiser, isAdmin } = useAuth();
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

      if (isAdmin()) response = await adminAPI.getAllChats();
      else response = await chatAPI.getChats();

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
      const fullName = `${p.userId?.firstName || ''} ${p.userId?.lastName || ''}`.trim();
      return fullName.toLowerCase().includes(searchQuery.toLowerCase());
    }) || (chat.lastMessage?.content?.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter = selectedFilter === 'all' ||
      (selectedFilter === 'unread' && unreadCounts[chat._id] > 0) ||
      (selectedFilter === 'orders' && chat.type === 'order') ||
      (selectedFilter === 'support' && chat.type === 'support');

    return matchesSearch && matchesFilter;
  });

  // Sort chats: unread or new first, then latest message
  const sortedChats = [...filteredChats].sort((a, b) => {
    const unreadA = unreadCounts[a._id] || 0;
    const unreadB = unreadCounts[b._id] || 0;

    if (unreadA > 0 && unreadB === 0) return -1;
    if (unreadB > 0 && unreadA === 0) return 1;

    const timeA = new Date(a.lastMessage?.createdAt || 0).getTime();
    const timeB = new Date(b.lastMessage?.createdAt || 0).getTime();
    return timeB - timeA;
  });

  const getChatDisplayName = (chat) => {
    const other = chat.participants.find(p => p.userId?._id !== user?._id);
    if (other?.userId) {
      const first = other.userId.firstName || '';
      const last = other.userId.lastName || '';
      return `${first} ${last}`.trim() || 'User';
    }
    return 'Chat';
  };

  const getLastMessagePreview = (message) => {
    if (!message) return 'No messages yet';
    if (message.messageType === 'file' || message.type === 'file') return `📎 ${message.attachments?.[0]?.filename || 'File'}`;
    if (message.messageType === 'image' || message.type === 'image') return `📷 Image`;
    const content = message.content || '';
    return content.length > 25 ? `${content.substring(0, 25)}...` : content;
  };

  const getUserRoleSpecificChats = () => {
    if (isAdmin()) return sortedChats;
    if (isPublisher()) return sortedChats.filter(chat =>
      chat.participants.some(p => p.role === 'publisher') || chat.type === 'order'
    );
    if (isAdvertiser()) return sortedChats.filter(chat =>
      chat.participants.some(p => p.role === 'advertiser') || chat.type === 'order'
    );
    return sortedChats;
  };

  const handleChatSelect = (chat) => {
    onChatSelect(chat);
    // Remove highlight when chat is viewed
    setHighlightedChats(prev => ({
      ...prev,
      [chat._id]: false
    }));
  };

  if (loading) {
    return (
      <div className="w-80 bg-[#0c0c0c] border-r border-[#bff747]/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#bff747]" />
      </div>
    );
  }

  return (
    <div className="w-80 bg-[#0c0c0c] border-r border-[#bff747]/30 flex flex-col scrollbar-hidden">
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
            className="block w-full pl-10 pr-3 py-2 bg-[#1a1a1a] border border-[#bff747]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#bff747] focus:border-[#bff747]"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto scrollbar-hidden">
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
            const hasUnread = unreadCount > 0;
            const isHighlighted = highlightedChats[chat._id] || false;

            return (
              <div
                key={chat._id}
                onClick={() => handleChatSelect(chat)}
                className={`p-3 border-b border-[#bff747]/10 cursor-pointer transition-colors duration-500
                  ${isActive ? 'bg-[#2a2a2a]' : ''}
                  ${isHighlighted ? 'bg-[#bff747]/20' : hasUnread ? 'bg-[#bff747]/10' : ''}
                  hover:bg-[#1a1a1a]'
                `}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative flex-shrink-0">
                    <UserCircleIcon className={`h-12 w-12 ${hasUnread || isHighlighted ? 'text-[#bff747]' : 'text-[#bff747]/70'}`} />
                    {chat.participants.some(p => p.userId?._id !== user?._id) &&
                      isUserOnline(chat.participants.find(p => p.userId?._id !== user?._id).userId._id) && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-[#bff747] rounded-full border-2 border-[#0c0c0c]" />
                      )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <p className={`text-sm font-medium truncate ${hasUnread || isHighlighted ? 'text-[#bff747]' : 'text-[#bff747]/70'}`}>
                        {getChatDisplayName(chat)}
                      </p>
                      {chat.lastMessage?.createdAt && (
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                          {formatDistanceToNow(new Date(chat.lastMessage.createdAt), { addSuffix: false })}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      {chat.lastMessage && (
                        <p className={`text-sm ${hasUnread || isHighlighted ? 'text-white font-medium' : 'text-gray-300'} break-words whitespace-normal truncate`}>
                          {getLastMessagePreview(chat.lastMessage)}
                        </p>
                      )}
                      {unreadCount > 0 && (
                        <span className="bg-[#bff747] text-[#0c0c0c] text-xs rounded-full px-2 py-1 min-w-5 text-center ml-2 font-bold">
                          {unreadCount > 99 ? '99+' : unreadCount}
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

      <style jsx>{`
        .scrollbar-hidden::-webkit-scrollbar { display: none; }
        .scrollbar-hidden { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default ChatSidebar;