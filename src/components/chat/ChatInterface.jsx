import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  FaceSmileIcon,
  XMarkIcon,
  UserCircleIcon,
  EllipsisVerticalIcon,
  PhotoIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

const ChatInterface = ({ chatId, chatType = 'order', onClose }) => {
  const { user } = useAuth();
  const {
    isConnected,
    activeChat,
    joinChat,
    leaveChat,
    sendMessage,
    startTyping,
    stopTyping,
    getChatMessages,
    getTypingUsersText,
    isUserOnline,
    markAsRead,
    chats,
    loadChats // Added loadChats to ensure chats are loaded
  } = useChat();

  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isAtBottom, setIsAtBottom] = useState(true); // Track if user is at bottom
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesContainerRef = useRef(null); // Ref for messages container
  const previousMessageCountRef = useRef(0); // Track previous message count
  const isInitialLoadRef = useRef(true); // Track initial load

  const messages = getChatMessages(chatId);
  
  // Sort messages by createdAt timestamp (oldest first)
  const sortedMessages = [...messages].sort((a, b) => 
    new Date(a.createdAt) - new Date(b.createdAt)
  );

  // Find the current chat from the chats array
  const currentChat = chats?.find(chat => chat._id === chatId);
  
  // Get the other participant's name
  const getOtherParticipantName = () => {
    if (!currentChat || !currentChat.participants || !user) return 'Chat';
    
    const otherParticipant = currentChat.participants.find(p => p.userId?._id !== user._id);
    if (otherParticipant && otherParticipant.userId) {
      const firstName = otherParticipant.userId.firstName || '';
      const lastName = otherParticipant.userId.lastName || '';
      const name = `${firstName} ${lastName}`.trim();
      return name || 'User';
    }
    
    const currentUserParticipant = currentChat.participants.find(p => p.userId?._id === user._id);
    if (currentUserParticipant && currentUserParticipant.userId) {
      const firstName = currentUserParticipant.userId.firstName || '';
      const lastName = currentUserParticipant.userId.lastName || '';
      const name = `${firstName} ${lastName}`.trim();
      return name || 'User';
    }
    
    return 'Chat';
  };

  // Get participant name by user ID with fallback to message sender name
  const getParticipantName = (userId) => {
    if (!currentChat || !currentChat.participants) {
      // Fallback to message sender name if available
      const messageWithSender = sortedMessages.find(msg => msg.senderId === userId);
      if (messageWithSender && messageWithSender.senderName) {
        return messageWithSender.senderName;
      }
      return 'Unknown User';
    }
    
    const participant = currentChat.participants.find(p => p.userId?._id === userId);
    if (participant && participant.userId) {
      const firstName = participant.userId.firstName || '';
      const lastName = participant.userId.lastName || '';
      const name = `${firstName} ${lastName}`.trim();
      return name || 'Unknown User';
    }
    
    // Fallback to message sender name if available
    const messageWithSender = sortedMessages.find(msg => msg.senderId === userId);
    if (messageWithSender && messageWithSender.senderName) {
      return messageWithSender.senderName;
    }
    
    return 'Unknown User';
  };

  // Get participant role by user ID from chat participants
  const getParticipantRole = (userId) => {
    if (!currentChat || !currentChat.participants) return null;
    
    const participant = currentChat.participants.find(p => p.userId?._id === userId);
    return participant ? participant.role : null;
  };

  // Get sender role from message data (either from message.senderRole or participant lookup)
  const getMessageSenderRole = (msg) => {
    // First check if sender role is directly available in the message
    if (msg.senderRole) {
      return msg.senderRole;
    }
    
    // If not, look up the role from chat participants
    if (msg.senderId) {
      const role = getParticipantRole(msg.senderId);
      return role || 'user';
    }
    
    // Default fallback
    return 'user';
  };

  const otherParticipantName = getOtherParticipantName();

  // Load chats when component mounts to ensure data is available
  useEffect(() => {
    if (!chats || chats.length === 0) {
      loadChats();
    }
  }, [chats, loadChats]);

  useEffect(() => {
    if (chatId && isConnected) {
      joinChat(chatId);
    }

    return () => {
      if (chatId) {
        leaveChat(chatId);
      }
    };
  }, [chatId, isConnected, joinChat, leaveChat]);

  const scrollToBottom = useCallback(() => {
    // Use requestAnimationFrame to ensure DOM is updated before scrolling
    requestAnimationFrame(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }, []);

  // Check if user is at bottom of chat
  const checkIfAtBottom = useCallback(() => {
    if (!messagesContainerRef.current) return true;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    // Consider user at bottom if they're within 10px of the bottom
    return scrollTop + clientHeight >= scrollHeight - 10;
  }, []);

  // Handle scroll events to track user position
  const handleScroll = useCallback(() => {
    setIsAtBottom(checkIfAtBottom());
  }, [checkIfAtBottom]);

  // Scroll to bottom when messages change, but only if user is at bottom or new messages arrive
  useEffect(() => {
    const isNewMessage = sortedMessages.length > previousMessageCountRef.current;
    const wasInitialLoad = isInitialLoadRef.current;
    
    // Update refs
    previousMessageCountRef.current = sortedMessages.length;
    if (wasInitialLoad) {
      isInitialLoadRef.current = false;
    }
    
    // If it's a new message and user is at bottom, scroll to bottom
    if (isNewMessage && isAtBottom) {
      scrollToBottom();
    }
    
    // If it's the first load, scroll to bottom
    if (wasInitialLoad && sortedMessages.length > 0) {
      scrollToBottom();
      // After initial load, check if we're at bottom
      setTimeout(() => {
        setIsAtBottom(checkIfAtBottom());
      }, 100);
    }
    
    // Always scroll to bottom if we have messages and it's the initial load
    if (wasInitialLoad && sortedMessages.length > 0) {
      scrollToBottom();
    }
  }, [sortedMessages, scrollToBottom, isAtBottom, checkIfAtBottom]);

  // Add scroll listener to messages container
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      // Initial check
      setIsAtBottom(checkIfAtBottom());
      
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll, checkIfAtBottom]);

  // Mark messages as read when chat is active
  useEffect(() => {
    if (activeChat === chatId && messages.length > 0) {
      const unreadMessages = messages.filter(msg => !msg.isRead?.includes(user?._id));
      if (unreadMessages.length > 0) {
        markAsRead(chatId, unreadMessages.map(msg => msg._id));
      }
    }
  }, [activeChat, messages, chatId, markAsRead, user?._id]);

  const handleSendMessage = () => {
    if ((message.trim() || selectedFiles.length > 0) && isConnected) {
      // Prepare attachments
      const attachments = selectedFiles.map(file => ({
        filename: file.name,
        fileType: file.type,
        fileSize: file.size
      }));
      
      sendMessage(chatId, message, 'text', null, attachments);
      setMessage('');
      setSelectedFiles([]);
      stopTyping(chatId);
      setIsTyping(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types (only images and ZIP files)
    const validFiles = files.filter(file => {
      const fileType = file.type;
      const isValidType = fileType.startsWith('image/') || fileType === 'application/zip';
      return isValidType;
    });
    
    // Check file sizes (max 10MB each)
    const validSizeFiles = validFiles.filter(file => file.size <= 10 * 1024 * 1024);
    
    if (validSizeFiles.length !== files.length) {
      alert('Some files were rejected. Only images and ZIP files up to 10MB are allowed.');
    }
    
    if (validSizeFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validSizeFiles]);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = (value) => {
    setMessage(value);
    
    if (!isTyping) {
      setIsTyping(true);
      startTyping(chatId);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      stopTyping(chatId);
    }, 2000);
  };

  const formatMessageTime = (timestamp) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const getMessageStatusIcon = (msg) => {
    if (msg.isRead && msg.isRead.length > 0) {
      return <span className="text-[#bff747]">✓✓</span>;
    }
    if (msg.sent) {
      return <span className="text-gray-400">✓</span>;
    }
    return <span className="text-gray-500">○</span>;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="flex flex-col h-full bg-[#0c0c0c]">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#bff747]/30 bg-[#1a1a1a] flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <UserCircleIcon className="h-10 w-10 text-[#bff747]" />
            <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#0c0c0c] ${isConnected ? 'bg-[#bff747]' : 'bg-gray-500'}`}></div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#bff747]">
              {otherParticipantName}
            </h3>
            {currentChat?.websiteId ? (
              <div className="flex flex-col">
                <p className="text-sm text-gray-300">
                  Website: {typeof currentChat.websiteId === 'object' ? currentChat.websiteId.domain : currentChat.websiteId}
                </p>
                <p className="text-xs text-gray-400">
                  {isConnected ? 'online' : 'offline'}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-300">
                {isConnected ? 'online' : 'offline'}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 text-[#bff747] hover:text-[#a8e035] rounded-full hover:bg-[#2a2a2a]">
            <EllipsisVerticalIcon className="h-5 w-5" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-[#bff747] hover:text-[#a8e035] rounded-full hover:bg-[#2a2a2a]"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Messages Area */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 bg-[#0c0c0c]"
          onScroll={handleScroll}
        >
          {sortedMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="bg-[#1a1a1a] border-2 border-dashed border-[#bff747]/30 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <UserCircleIcon className="h-8 w-8 text-[#bff747]" />
              </div>
              <h3 className="text-xl font-semibold text-[#bff747] mb-2">No messages yet</h3>
              <p className="text-gray-400 mb-6">Send a message to start the conversation</p>
              <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#bff747]/30">
                <p className="text-sm text-gray-300">Messages are end-to-end encrypted. No one outside of this chat, including the admin, can read them.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedMessages.map((msg, index) => {
                // Determine if we should show the sender name (for received messages)
                const showSenderName = msg.senderId !== user?._id && 
                  (index === 0 || sortedMessages[index - 1].senderId !== msg.senderId);
              
                // Get sender role to determine alignment
                const senderRole = getMessageSenderRole(msg);
                const isSenderCurrentUser = msg.senderId === user?._id;
                
                // Determine alignment based on sender role (WhatsApp style)
                let justifyContent;
                let isOwnMessage;
                
                if (isSenderCurrentUser) {
                  // Current user's messages go to the right
                  justifyContent = 'justify-end';
                  isOwnMessage = true;
                } else if (senderRole === 'publisher') {
                  // Publisher messages go to the left
                  justifyContent = 'justify-start';
                  isOwnMessage = false;
                } else if (senderRole === 'advertiser') {
                  // Advertiser messages go to the right
                  justifyContent = 'justify-end';
                  isOwnMessage = false;
                } else {
                  // Fallback - current user's messages to the right, others to the left
                  justifyContent = isSenderCurrentUser ? 'justify-end' : 'justify-start';
                  isOwnMessage = isSenderCurrentUser;
                }
              
                return (
                  <div
                    key={msg._id || index} // Fallback to index if _id is missing
                    className={`flex ${justifyContent}`}
                  >
                    <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl`}>
                      
                      {showSenderName && (
                        <div className={`text-xs mb-1 ${isOwnMessage ? 'text-[#0c0c0c]' : 'text-gray-400'}`}>
                          {getParticipantName(msg.senderId)}
                        </div>
                      )}
                      
                      <div className={`rounded-lg px-4 py-2 ${isOwnMessage ? 'bg-[#bff747] text-[#0c0c0c]' : 'bg-[#1a1a1a] text-gray-200 border border-[#bff747]/30'}`}>
                        {msg.replyTo && (
                          <div className={`mb-2 p-2 rounded ${isOwnMessage ? 'bg-[#a8e035]' : 'bg-[#2a2a2a]'}`}>
                            <p className="text-xs opacity-75">Replying to:</p>
                            <p className="text-sm truncate">{msg.replyTo.content}</p>
                          </div>
                        )}
                        {/* Show warning badge for messages with personal details */}
                        {msg.flags?.containsPersonalDetails && (
                          <div className="mb-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900 text-red-200">
                              Contains personal information - blocked by system
                            </span>
                          </div>
                        )}
                        <p className="text-sm">{msg.content || 'No content'}</p>
                        
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {msg.attachments.map((attachment, idx) => (
                              <div key={idx} className={`flex items-center space-x-2 text-xs p-2 rounded ${isOwnMessage ? 'bg-[#a8e035]' : 'bg-[#2a2a2a]'}`}>
                                <PaperClipIcon className="h-4 w-4 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="truncate">{attachment.filename || attachment.fileName || 'Attachment'}</p>
                                  <p className="text-xs opacity-75">{formatFileSize(attachment.fileSize || 0)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className={`text-xs mt-1 flex items-center justify-end ${isOwnMessage ? 'text-[#0c0c0c]' : 'text-gray-400'}`}>
                          <span>{msg.createdAt ? formatMessageTime(msg.createdAt) : 'Just now'}</span>
                          {isOwnMessage && (
                            <span className="ml-1">{getMessageStatusIcon(msg)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>
          )}
          
          {/* Typing Indicator */}
          {getTypingUsersText(chatId) && (
            <div className="flex justify-start mt-2">
              <div className="bg-[#1a1a1a] text-gray-200 rounded-lg px-4 py-2 border border-[#bff747]/30">
                <p className="text-sm text-gray-300 italic">{getTypingUsersText(chatId)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="border-t border-[#bff747]/30 p-2 bg-[#1a1a1a] flex-shrink-0">
            <div className="flex flex-wrap gap-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="relative flex items-center bg-[#2a2a2a] rounded-lg border border-[#bff747]/30 p-2 max-w-xs shadow-sm">
                  <div className="flex items-center space-x-2">
                    {file.type.startsWith('image/') ? (
                      <PhotoIcon className="h-5 w-5 text-[#bff747]" />
                    ) : (
                      <ArchiveBoxIcon className="h-5 w-5 text-[#bff747]" />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-200 truncate">{file.name}</p>
                      <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="ml-2 text-gray-400 hover:text-red-400"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="border-t border-[#bff747]/30 p-2 bg-[#1a1a1a] flex-shrink-0">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <div className="relative">
                <textarea
                  ref={messageInputRef}
                  value={message}
                  onChange={(e) => handleTyping(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  rows={1}
                  className="block w-full px-4 py-3 bg-[#2a2a2a] border border-[#bff747]/30 rounded-full resize-none focus:ring-2 focus:ring-[#bff747] focus:border-transparent text-white placeholder-gray-500"
                  style={{ minHeight: '40px', maxHeight: '120px' }}
                />
                
                <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1 text-[#bff747] hover:text-[#a8e035] rounded-full hover:bg-[#3a3a3a]"
                  >
                    <PaperClipIcon className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-1 text-[#bff747] hover:text-[#a8e035] rounded-full hover:bg-[#3a3a3a]"
                  >
                    <FaceSmileIcon className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  multiple
                  accept="image/*,.zip"
                />
              </div>
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={(!message.trim() && selectedFiles.length === 0) || !isConnected}
              className={`flex-shrink-0 p-3 rounded-full ${
                message.trim() || selectedFiles.length > 0 
                  ? 'bg-[#bff747] text-[#0c0c0c] hover:bg-[#a8e035]' 
                  : 'bg-[#3a3a3a] text-gray-500'
              } transition-colors`}
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;