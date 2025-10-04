import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { chatAPI, adminAPI } from '../services/api';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user, token, isPublisher, isAdvertiser, isAdmin } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [notifications, setNotifications] = useState([]);

  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const socketRef = useRef(null);

  // Chat management functions
  const joinChat = useCallback((chatId) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('join_chat', { chatId });
      setActiveChat(chatId);
      
      // Clear unread count for this chat
      setUnreadCounts(prev => ({
        ...prev,
        [chatId]: 0
      }));
    }
  }, []);

  const leaveChat = useCallback((chatId) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('leave_chat', { chatId });
      if (activeChat === chatId) {
        setActiveChat(null);
      }
    }
  }, [activeChat]);

  const sendMessage = useCallback((chatId, content, type = 'text', replyTo = null, attachments = []) => {
    if (socketRef.current && socketRef.current.connected && content.trim()) {
      const messageData = {
        chatId,
        content: content.trim(),
        type,
        replyTo,
        attachments
      };
      
      socketRef.current.emit('send_message', messageData);
    }
  }, []);

  const startTyping = useCallback((chatId) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('typing_start', { chatId });
    }
  }, []);

  const stopTyping = useCallback((chatId) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('typing_stop', { chatId });
    }
  }, []);

  const markAsRead = useCallback((chatId, messageIds) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('mark_as_read', { chatId, messageIds });
      
      // Update local state
      setUnreadCounts(prev => ({
        ...prev,
        [chatId]: 0
      }));
    }
  }, []);

  const getTypingUsersText = useCallback((chatId) => {
    const typing = typingUsers[chatId] || {};
    const users = Object.values(typing);
    
    if (users.length === 0) return '';
    if (users.length === 1) return `${users[0]} is typing...`;
    if (users.length === 2) return `${users[0]} and ${users[1]} are typing...`;
    return `${users[0]} and ${users.length - 1} others are typing...`;
  }, [typingUsers]);

  const isUserOnline = useCallback((userId) => {
    return onlineUsers.some(user => user.userId === userId && user.status === 'online');
  }, [onlineUsers]);

  const getChatMessages = useCallback((chatId) => {
    return messages[chatId] || [];
  }, [messages]);

  const getTotalUnreadCount = useCallback(() => {
    return Object.values(unreadCounts).reduce((total, count) => total + count, 0);
  }, [unreadCounts]);

  const loadChats = useCallback(async () => {
    try {
      let response;
      
      // If user is admin, fetch all chats using adminAPI
      if (user && user.role === 'admin') {
        response = await adminAPI.getAllChats();
      } else if (user) {
        // For non-admin users, use regular chatAPI
        response = await chatAPI.getChats();
      } else {
        // No user, return empty array
        setChats([]);
        return;
      }
      
      if (response.data && response.data.ok) {
        setChats(response.data.data);
      } else {
        // If response is not ok, set empty array
        setChats([]);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
      // On error, set empty array to avoid undefined state
      setChats([]);
    }
  }, [user]);

  // Memoize connectSocket to prevent recreation on every render
  const connectSocket = useCallback(() => {
    // If already connected, don't reconnect
    if (socketRef.current?.connected) return;

    // Clean up existing socket
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    // Use import.meta.env instead of process.env for Vite
    // Added defensive coding to prevent "process is not defined" error
    let serverUrl = 'http://localhost:3000';
    
    try {
      // Check if import.meta.env is available (more compatible approach)
      if (import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL) {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        serverUrl = baseUrl.replace('/api/v1', '') || serverUrl;
      }
    } catch (error) {
      console.warn('Could not access environment variables, using default URL:', error);
    }
    
    const socketInstance = io(serverUrl, {
      auth: {
        token: token
      },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('✅ Connected to chat server');
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
      
      // Request online users
      socketInstance.emit('get_online_users');
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('❌ Disconnected from chat server:', reason);
      setIsConnected(false);
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        handleReconnect();
      }
    });

    socketInstance.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      setIsConnected(false);
      handleReconnect();
    });

    // Chat event listeners
    setupChatEventListeners(socketInstance);
  }, [token]);

  const handleReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
    reconnectAttemptsRef.current++;

    reconnectTimeoutRef.current = setTimeout(() => {
      console.log(`Attempting to reconnect... (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
      connectSocket();
    }, delay);
  }, [connectSocket]);

  const disconnectSocket = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    setSocket(null);
    setIsConnected(false);
    setMessages({});
    setOnlineUsers([]);
    setTypingUsers({});
  }, []);

  const setupChatEventListeners = (socketInstance) => {
    // New message received
    socketInstance.on('new_message', (data) => {
      const { chatId, message } = data;
      
      // Ensure message has required fields
      const messageWithDefaults = {
        _id: message._id || Date.now().toString(),
        senderId: message.senderId || message.sender || '',
        senderName: message.senderName || 'Unknown User',
        content: message.content || '',
        createdAt: message.createdAt || new Date(),
        ...message
      };
      
      setMessages(prev => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), messageWithDefaults]
      }));

      // Update unread count if not in active chat
      if (activeChat !== chatId && messageWithDefaults.senderId !== user?._id) {
        setUnreadCounts(prev => ({
          ...prev,
          [chatId]: (prev[chatId] || 0) + 1
        }));
      }

      // Update chat last message
      setChats(prev => prev.map(chat => 
        chat._id === chatId 
          ? { ...chat, lastMessage: messageWithDefaults, lastActivity: new Date() }
          : chat
      ));
    });

    // Chat history received
    socketInstance.on('chat_history', (data) => {
      const { chatId, messages: chatMessages } = data;
      
      // Ensure all messages have required fields
      const messagesWithDefaults = chatMessages.map(msg => ({
        _id: msg._id || Date.now().toString(),
        senderId: msg.senderId || msg.sender || '',
        senderName: msg.senderName || 'Unknown User',
        content: msg.content || '',
        createdAt: msg.createdAt || new Date(),
        ...msg
      }));
      
      setMessages(prev => ({
        ...prev,
        [chatId]: messagesWithDefaults
      }));
    });

    // User typing indicators
    socketInstance.on('user_typing', (data) => {
      const { chatId, userId, userName } = data;
      setTypingUsers(prev => ({
        ...prev,
        [chatId]: { ...prev[chatId], [userId]: userName }
      }));
    });

    socketInstance.on('user_stopped_typing', (data) => {
      const { chatId, userId } = data;
      setTypingUsers(prev => {
        const chatTyping = { ...prev[chatId] };
        delete chatTyping[userId];
        return {
          ...prev,
          [chatId]: chatTyping
        };
      });
    });

    // Online users list
    socketInstance.on('online_users', (users) => {
      setOnlineUsers(users);
    });

    // User status changes
    socketInstance.on('user_status_changed', (data) => {
      const { userId, status } = data;
      setOnlineUsers(prev => prev.map(user => 
        user.userId === userId ? { ...user, status } : user
      ));
    });

    // Messages marked as read
    socketInstance.on('messages_read', (data) => {
      const { chatId, messageIds, readBy } = data;
      setMessages(prev => ({
        ...prev,
        [chatId]: prev[chatId]?.map(msg => 
          messageIds.includes(msg._id) 
            ? { ...msg, isRead: [...(msg.isRead || []), readBy] }
            : msg
        ) || []
      }));
    });

    // File upload progress
    socketInstance.on('file_upload_progress', (data) => {
      // Handle file upload progress updates
      console.log('File upload progress:', data);
    });

    // Notifications
    socketInstance.on('new_notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    // Error handling
    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
      // You could show a toast notification here
    });
  };

  useEffect(() => {
    if (user && token) {
      connectSocket();
      loadChats();
    } else {
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [user, token, connectSocket, disconnectSocket, loadChats]);

  const value = {
    // Connection state
    socket,
    isConnected,
    
    // Chat data
    chats,
    setChats,
    activeChat,
    messages,
    onlineUsers,
    typingUsers,
    unreadCounts,
    notifications,
    
    // Actions
    joinChat,
    leaveChat,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    
    // Utilities
    getTypingUsersText,
    isUserOnline,
    getChatMessages,
    getTotalUnreadCount,
    loadChats,
    
    // Connection management
    connectSocket,
    disconnectSocket
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};