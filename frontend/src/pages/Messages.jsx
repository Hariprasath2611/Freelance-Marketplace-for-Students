import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import { 
  Send, Paperclip, Smile, Search, CheckCheck, 
  Circle, MoreVertical, ShieldAlert 
} from 'lucide-react';

export const Messages = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const location = useLocation();

  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // Selected conversation user object
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  
  // Typing state
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  // Attachment uploading
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);

  const messagesEndRef = useRef(null);

  const loadConversations = async (autoSelectId = null) => {
    try {
      const res = await api.get('/chat/conversations');
      setConversations(res.data);

      if (autoSelectId) {
        const found = res.data.find(c => c._id.toString() === autoSelectId.toString());
        if (found) {
          setActiveChat(found);
        } else {
          // If conversation doesn't exist in active chats yet, look up user profile details
          try {
            const userProfile = await api.get(`/users/profile`); // generic call or make query
            // Simple lookup in freelancers or other users
            const userRes = await api.get(`/users/freelancers?keyword=`);
            const targetUser = userRes.data.find(u => u._id.toString() === autoSelectId.toString());
            if (targetUser) {
              const mockConv = {
                _id: targetUser._id,
                name: targetUser.name,
                email: targetUser.email,
                profileImage: targetUser.profileImage,
                role: targetUser.role,
                lastMessage: '',
                lastMessageTime: new Date(),
                unreadCount: 0
              };
              setConversations(prev => [mockConv, ...prev]);
              setActiveChat(mockConv);
            }
          } catch (e) {
            console.error('Error looking up new chat partner:', e);
          }
        }
      } else if (res.data.length > 0 && !activeChat) {
        // default select first chat
        setActiveChat(res.data[0]);
      }
    } catch (error) {
      console.error('Failed to load conversations list:', error);
    }
  };

  // On page load, fetch chats, handle query params ?chatWith=
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const targetUserId = params.get('chatWith');
    loadConversations(targetUserId);
  }, [location]);

  // Load message logs when activeChat user changes
  useEffect(() => {
    const fetchMessageLogs = async () => {
      if (!activeChat) return;
      try {
        const res = await api.get(`/chat/messages/${activeChat._id}`);
        setMessages(res.data);
        scrollToBottom();
        
        // Reset unread count locally
        setConversations(prev => 
          prev.map(c => c._id === activeChat._id ? { ...c, unreadCount: 0 } : c)
        );

        // Notify socket seen status
        if (socket) {
          socket.emit('messageSeen', { receiverId: user._id, senderId: activeChat._id });
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    };
    fetchMessageLogs();
  }, [activeChat, socket]);

  // Connect Sockets listeners
  useEffect(() => {
    if (socket) {
      // Message received handler
      const handleSocketMessage = (msg) => {
        // If message is from/to the active chat user, append to list
        const isFromActive = msg.senderId.toString() === activeChat?._id.toString();
        const isToActive = msg.receiverId.toString() === activeChat?._id.toString();

        if (isFromActive || isToActive) {
          setMessages(prev => [...prev, msg]);
          scrollToBottom();

          // Emit seen confirmation if message is from partner
          if (isFromActive) {
            socket.emit('messageSeen', { messageId: msg._id, senderId: activeChat._id, receiverId: user._id });
          }
        } else {
          // Message belongs to another conversation. Refresh conversations list.
          loadConversations();
        }
      };

      // Typing feedback listener
      const handleTypingStatus = ({ senderId, isTyping }) => {
        if (activeChat && senderId.toString() === activeChat._id.toString()) {
          setPartnerTyping(isTyping);
        }
      };

      // Message seen confirmation listener
      const handleMarkedSeen = ({ receiverId }) => {
        if (activeChat && receiverId.toString() === activeChat._id.toString()) {
          setMessages(prev => prev.map(m => m.senderId.toString() === user._id.toString() ? { ...m, isSeen: true } : m));
        }
      };

      socket.on('messageReceived', handleSocketMessage);
      socket.on('typingStatus', handleTypingStatus);
      socket.on('messagesMarkedSeen', handleMarkedSeen);

      return () => {
        socket.off('messageReceived', handleSocketMessage);
        socket.off('typingStatus', handleTypingStatus);
        socket.off('messagesMarkedSeen', handleMarkedSeen);
      };
    }
  }, [socket, activeChat]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    
    if (socket && activeChat) {
      if (!isTyping) {
        setIsTyping(true);
        socket.emit('typing', { senderId: user._id, receiverId: activeChat._id, isTyping: true });
      }

      // Reset typing timeout
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        socket.emit('typing', { senderId: user._id, receiverId: activeChat._id, isTyping: false });
      }, 2000);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() && !attachmentFile) return;

    setSendingMessage(true);

    if (attachmentFile) {
      // Use multipart form request for file attachment
      const formData = new FormData();
      formData.append('receiverId', activeChat._id);
      formData.append('message', inputText);
      formData.append('attachment', attachmentFile);

      try {
        const res = await api.post('/chat/messages', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        // Broadcast via socket so other tab/partner syncs
        if (socket) {
          socket.emit('sendMessage', {
            senderId: user._id,
            receiverId: activeChat._id,
            message: inputText,
            attachment: res.data.attachment
          });
        }
        
        setInputText('');
        setAttachmentFile(null);
      } catch (err) {
        console.error('Failed to send attachment:', err);
      } finally {
        setSendingMessage(false);
      }
    } else {
      // Normal socket text emit
      if (socket) {
        socket.emit('sendMessage', {
          senderId: user._id,
          receiverId: activeChat._id,
          message: inputText
        });
      }
      setInputText('');
      setSendingMessage(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-80px)] flex flex-col transition-colors duration-300">
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-3 border border-slate-200 dark:border-darkBorder rounded-3xl glass shadow-xl overflow-hidden">
        
        {/* Left Side: Chats list */}
        <div className="md:col-span-1 border-r border-slate-200 dark:border-darkBorder flex flex-col bg-white/20 dark:bg-darkBg/20">
          <div className="p-4 border-b border-slate-200 dark:border-darkBorder">
            <h2 className="text-base font-bold text-slate-800 dark:text-white">Conversations</h2>
            <div className="relative mt-3">
              <input 
                type="text" 
                placeholder="Search messages..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 dark:border-darkBorder rounded-xl bg-slate-50 dark:bg-darkBg outline-none text-slate-700 dark:text-slate-200"
              />
              <Search size={12} className="absolute left-3 top-2.5 text-slate-400" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-darkBorder/20">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No active conversations yet
              </div>
            ) : (
              conversations.map((conv) => {
                const isActive = activeChat?._id === conv._id;
                return (
                  <button
                    key={conv._id}
                    onClick={() => setActiveChat(conv)}
                    className={`w-full p-4 flex gap-3 text-left transition-colors hover:bg-slate-50/50 dark:hover:bg-darkCard/30 ${isActive ? 'bg-primary-500/5 dark:bg-primary-900/10 border-l-2 border-primary-500' : ''}`}
                  >
                    {conv.profileImage ? (
                      <img 
                        src={conv.profileImage} 
                        alt={conv.name} 
                        className="w-10 h-10 rounded-full object-cover border border-slate-100 dark:border-darkBorder"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center text-xs uppercase shadow-sm">
                        {conv.name.substring(0, 2)}
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{conv.name}</h4>
                        <span className="text-[9px] text-slate-400">
                          {new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-1">{conv.lastMessage || 'Open chat log...'}</p>
                    </div>

                    {conv.unreadCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-indigo-500 text-[9px] font-bold text-white flex items-center justify-center self-center shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Message pane */}
        <div className="md:col-span-2 flex flex-col bg-white/40 dark:bg-darkCard/25">
          {activeChat ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-200 dark:border-darkBorder flex items-center justify-between bg-white/65 dark:bg-darkBg/65">
                <div className="flex items-center gap-3">
                  {activeChat.profileImage ? (
                    <img 
                      src={activeChat.profileImage} 
                      alt={activeChat.name} 
                      className="w-10 h-10 rounded-full object-cover border border-slate-100 dark:border-darkBorder"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center text-xs uppercase">
                      {activeChat.name.substring(0, 2)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-white">{activeChat.name}</h3>
                    <span className="text-[9px] text-slate-400 capitalize block mt-0.5">{activeChat.role}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <Circle size={8} className="fill-emerald-500 text-emerald-500" />
                  <span>Online</span>
                </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                  const isOwn = msg.senderId.toString() === user._id.toString();
                  return (
                    <div 
                      key={msg._id} 
                      className={`flex flex-col max-w-[75%] ${isOwn ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                    >
                      <div className={`p-3 rounded-2xl text-xs relative ${
                        isOwn 
                          ? 'bg-primary-500 text-white rounded-tr-none' 
                          : 'bg-slate-200 dark:bg-darkBorder/40 text-slate-800 dark:text-slate-200 rounded-tl-none'
                      }`}>
                        
                        {/* Message body */}
                        {msg.message && <p className="leading-relaxed break-words">{msg.message}</p>}

                        {/* Message attachments */}
                        {msg.attachment?.url && (
                          <div className={`mt-2 ${msg.message ? 'border-t border-white/20 pt-2' : ''}`}>
                            <a 
                              href={`http://localhost:5000${msg.attachment.url}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 font-semibold text-[10px] hover:underline"
                            >
                              <Paperclip size={10} /> 
                              <span>Attachment: {msg.attachment.name}</span>
                            </a>
                          </div>
                        )}

                        <span className="block text-[8px] text-right opacity-60 mt-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Seen indicator (only for own messages) */}
                      {isOwn && (
                        <div className="mt-1 flex items-center gap-1 text-[8px] text-slate-400">
                          {msg.isSeen ? <CheckCheck size={10} className="text-primary-500" /> : <CheckCheck size={10} />}
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {/* Typing indicators */}
                {partnerTyping && (
                  <div className="flex items-center gap-1 text-[9px] text-slate-400">
                    <div className="flex gap-0.5">
                      <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></span>
                      <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                      <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                    </div>
                    <span>{activeChat.name} is typing...</span>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Form Input Footer */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 dark:border-darkBorder bg-white/65 dark:bg-darkBg/65 space-y-2">
                
                {/* File Upload indicator snippet */}
                {attachmentFile && (
                  <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-primary-500 text-[9px] rounded-lg w-fit flex items-center gap-1.5">
                    <Paperclip size={10} /> 
                    <span>{attachmentFile.name}</span>
                    <button 
                      type="button" 
                      onClick={() => setAttachmentFile(null)}
                      className="hover:text-rose-500 font-bold ml-2"
                    >
                      X
                    </button>
                  </div>
                )}

                <div className="flex gap-2 items-center">
                  <div className="relative shrink-0 cursor-pointer p-2 hover:bg-slate-100 dark:hover:bg-darkBorder/40 rounded-full text-slate-400">
                    <input 
                      type="file" 
                      onChange={(e) => setAttachmentFile(e.target.files[0])}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Paperclip size={16} />
                  </div>
                  
                  <input 
                    type="text" 
                    placeholder="Type message..."
                    value={inputText}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-2 text-xs border border-slate-200 dark:border-darkBorder rounded-xl bg-slate-50 dark:bg-darkBg focus:ring-1 focus:ring-primary-500 outline-none text-slate-700 dark:text-slate-200"
                  />

                  <button
                    type="submit"
                    disabled={sendingMessage}
                    className="p-2.5 bg-primary-500 hover:bg-primary-600 rounded-xl text-white shadow-sm flex items-center justify-center"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center p-6 text-slate-400">
              <span className="text-xs">Select a conversation from the left panel to begin.</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
export default Messages;
