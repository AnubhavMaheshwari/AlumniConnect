import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  LuSearch,
  LuUsers,
  LuSend,
  LuPaperclip,
  LuFileText,
  LuArrowLeft,
  LuX,
  LuPlus,
  LuEllipsisVertical,
  LuCheckCheck,
  LuCheck,
  LuFlag,
  LuShieldAlert,
  LuLock,
  LuMessageSquare,
} from 'react-icons/lu';
import useIsMobile from '../hooks/useIsMobile';
import { formatDistanceToNow } from 'date-fns';

const ENDPOINT = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '');
let socket, selectedChatCompare;

/* ── Avatar Component (Matches Alumni Directory Style) ── */
const Avatar = ({ name = '', img, size = 42, onClick, isOnline }) => {
  const initials = name ? name.slice(0, 2).toUpperCase() : '??';
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <div
        onClick={onClick}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: img ? `url(${img}) center/cover no-repeat` : 'var(--color-panel)',
          color: 'var(--color-text)',
          border: '2px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: Math.round(size * 0.36),
          fontWeight: 800,
          fontFamily: 'var(--font-heading)',
          cursor: onClick ? 'pointer' : 'default',
          userSelect: 'none',
          boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
        }}
      >
        {!img && initials}
      </div>
      {isOnline && (
        <span
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: Math.max(9, Math.round(size * 0.24)),
            height: Math.max(9, Math.round(size * 0.24)),
            borderRadius: '50%',
            background: '#10b981',
            border: '2px solid var(--color-surface)',
          }}
          title="Online"
        />
      )}
    </div>
  );
};

const getDateDividerLabel = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return 'Today';
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

const Messages = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [chats, setChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [selectedChat, setSelectedChat] = useState(location.state?.selectedChat || null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Modals & Drawers
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupChatName, setGroupChatName] = useState('');
  const [groupSearch, setGroupSearch] = useState('');
  const [groupResults, setGroupResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [showGroupInfo, setShowGroupInfo] = useState(location.state?.showGroupInfo || false);
  const [addMemberSearch, setAddMemberSearch] = useState('');
  const [addMemberResults, setAddMemberResults] = useState([]);

  // Batch groups
  const [batchGroups, setBatchGroups] = useState([]);
  const [showBatchList, setShowBatchList] = useState(false);
  const [loadingBatches, setLoadingBatches] = useState(false);

  // Reporting & Editing
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportMessageId, setReportMessageId] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [editingMsgId, setEditingMsgId] = useState(null);

  // Attachments
  const [attachment, setAttachment] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Context menu
  const [contextMenu, setContextMenu] = useState(null);

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, []);

  const handleContextMenu = (e, m) => {
    e.preventDefault();
    setContextMenu({ x: e.pageX, y: e.pageY, msg: m });
  };

  /* Helper functions */
  const getChatName = (c) => {
    if (c.isGroupChat) return c.chatName;
    const recipient = c.users.find((u) => u._id !== user._id) || c.users[0];
    return recipient._id === user._id ? 'Saved Notes (You)' : recipient.name;
  };

  const getChatImage = (c) => {
    if (c.isGroupChat) return null;
    const recipient = c.users.find((u) => u._id !== user._id) || c.users[0];
    return recipient?.profileImage;
  };

  const getChatUserId = (c) => {
    const recipient = c.users.find((u) => u._id !== user._id) || c.users[0];
    return recipient?._id;
  };

  /* ── Socket Setup ── */
  useEffect(() => {
    if (!user?._id) return;

    socket = io(ENDPOINT, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socket.emit('setup', user);
    socket.on('connected', () => setSocketConnected(true));
    socket.on('typing', () => setIsTyping(true));
    socket.on('stop typing', () => setIsTyping(false));

    socket.on('message recieved', (newMessageRecieved) => {
      if (!selectedChatCompare || selectedChatCompare._id !== newMessageRecieved.chat._id) {
        toast.info(`New message from ${newMessageRecieved.sender.name}`, { autoClose: 2000 });
        setChats((prev) => {
          const existing = prev.find((c) => c._id === newMessageRecieved.chat._id);
          if (existing) {
            return prev
              .map((c) =>
                c._id === newMessageRecieved.chat._id
                  ? {
                      ...c,
                      latestMessage: newMessageRecieved,
                      unreadCount: (c.unreadCount || 0) + 1,
                    }
                  : c
              )
              .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
          }
          fetchChats();
          return prev;
        });
      } else {
        setMessages((prev) => [...prev, newMessageRecieved]);
        markChatAsRead(newMessageRecieved.chat._id);
      }
    });

    socket.on('message updated', (updatedMsg) => {
      if (selectedChatCompare && selectedChatCompare._id === updatedMsg.chat._id) {
        setMessages((prev) => prev.map((m) => (m._id === updatedMsg._id ? updatedMsg : m)));
      }
    });

    socket.on('message deleted', (deletedMsg) => {
      if (selectedChatCompare && selectedChatCompare._id === deletedMsg.chat._id) {
        setMessages((prev) => prev.map((m) => (m._id === deletedMsg._id ? deletedMsg : m)));
      }
    });

    return () => {
      socket.off('connected');
      socket.off('typing');
      socket.off('stop typing');
      socket.off('message recieved');
      socket.off('message updated');
      socket.off('message deleted');
      socket.disconnect();
    };
  }, [user?._id]);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (location.state?.userId) accessChat(location.state.userId);
  }, [location.state]);

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
    if (selectedChat) markChatAsRead(selectedChat._id);
  }, [selectedChat]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const fetchBatches = async () => {
    setLoadingBatches(true);
    try {
      const { data } = await API.get('/chat/batches');
      setBatchGroups(data);
    } catch {
      toast.error('Failed to load batch groups');
    } finally {
      setLoadingBatches(false);
    }
  };

  const joinBatch = async (chatId) => {
    try {
      const { data } = await API.put('/chat/groupadd', { chatId, userId: user._id });
      setChats((prev) => (prev.find((c) => c._id === data._id) ? prev : [data, ...prev]));
      setSelectedChat(data);
      setShowBatchList(false);
      toast.success('Joined batch group!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join batch');
    }
  };

  const fetchChats = async () => {
    try {
      const { data } = await API.get('/chat');
      setChats(data);
    } catch {
      toast.error('Failed to load conversations');
    } finally {
      setLoadingChats(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;
    setLoadingMessages(true);
    try {
      const { data } = await API.get(`/message/${selectedChat._id}`);
      setMessages(data);
      socket.emit('join chat', selectedChat._id);
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const markChatAsRead = async (chatId) => {
    try {
      await API.put(`/message/read/${chatId}`);
      setChats((prev) => prev.map((c) => (c._id === chatId ? { ...c, unreadCount: 0 } : c)));
    } catch (err) {
      console.error('Failed to mark messages as read', err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && !attachment) return;
    socket.emit('stop typing', selectedChat._id);

    if (attachment) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', attachment);
        formData.append('chatId', selectedChat._id);
        if (newMessage.trim()) formData.append('content', newMessage.trim());

        const { data } = await API.post('/message/attachment', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        socket.emit('new message', data);
        setMessages((prev) => [...prev, data]);
        setNewMessage('');
        setAttachment(null);
      } catch {
        toast.error('Failed to send file attachment');
      }
      setUploading(false);
      return;
    }

    const msgText = newMessage.trim();
    setNewMessage('');

    // Optimistic message append
    const tempId = Date.now().toString();
    const optimisticMsg = {
      _id: tempId,
      content: msgText,
      sender: user,
      chat: selectedChat,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const { data } = await API.post('/message', {
        content: msgText,
        chatId: selectedChat._id,
      });
      socket.emit('new message', data);
      setMessages((prev) => prev.map((msg) => (msg._id === tempId ? data : msg)));
    } catch {
      toast.error('Failed to deliver message');
      setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
    }
  };

  const startEditMenu = (msg) => {
    setEditingMsgId(msg._id);
    setNewMessage(msg.content);
    inputRef.current?.focus();
    setContextMenu(null);
  };

  const cancelEdit = () => {
    setEditingMsgId(null);
    setNewMessage('');
  };

  const saveEdit = async () => {
    if (!newMessage.trim()) return cancelEdit();
    try {
      const { data } = await API.put(`/message/${editingMsgId}`, { content: newMessage });
      socket.emit('message updated', data);
      setMessages((prev) => prev.map((m) => (m._id === data._id ? data : m)));
      cancelEdit();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update message');
    }
  };

  const deleteMessage = async (msgId) => {
    if (!window.confirm('Delete this message for everyone?')) return;
    try {
      const { data } = await API.delete(`/message/${msgId}`);
      socket.emit('message deleted', data);
      setMessages((prev) => prev.map((m) => (m._id === data._id ? data : m)));
    } catch {
      toast.error('Failed to delete message');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (editingMsgId) saveEdit();
      else sendMessage();
    }
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if (!socketConnected) return;
    if (!typing) {
      setTyping(true);
      socket.emit('typing', selectedChat._id);
    }
    const last = Date.now();
    setTimeout(() => {
      if (Date.now() - last >= 3000 && typing) {
        socket.emit('stop typing', selectedChat._id);
        setTyping(false);
      }
    }, 3000);
  };

  const handleSearch = async (q) => {
    setSearch(q);
    if (!q) return setSearchResults([]);
    try {
      const { data } = await API.get(`/users?search=${q}`);
      const apiResults = data.users || data;
      const directoryOnly = apiResults.filter((u) => {
        const alreadyHasChat = chats.find(
          (c) => !c.isGroupChat && c.users.find((cu) => cu._id === u._id)
        );
        return !alreadyHasChat && u._id !== user._id;
      });
      setSearchResults(directoryOnly);
    } catch {
      setSearchResults([]);
    }
  };

  const accessChat = async (userId) => {
    try {
      const { data } = await API.post('/chat', { userId });
      setChats((prev) => (prev.find((c) => c._id === data._id) ? prev : [data, ...prev]));
      setSelectedChat(data);
      setShowGroupModal(false);
      setSearch('');
      setSearchResults([]);
    } catch {
      toast.error('Error starting conversation');
    }
  };

  const handleSubmitGroup = async () => {
    if (!groupChatName || selectedUsers.length < 2) {
      toast.warning('Provide a group title and add at least 2 participants');
      return;
    }
    try {
      const { data } = await API.post('/chat/group', {
        name: groupChatName,
        users: JSON.stringify(selectedUsers.map((u) => u._id)),
      });
      setChats([data, ...chats]);
      setShowGroupModal(false);
      setSelectedUsers([]);
      setGroupChatName('');
      toast.success('Group created successfully!');
    } catch {
      toast.error('Failed to create group');
    }
  };

  const handleReportSubmit = async () => {
    if (!reportReason) return toast.warning('Please state the reason');
    try {
      await API.post('/message/report', {
        messageId: reportMessageId,
        reason: reportReason,
      });
      toast.success('Message reported to community moderators');
      setShowReportModal(false);
      setReportReason('');
      setReportMessageId(null);
    } catch {
      toast.error('Failed to submit report');
    }
  };

  const handleRemoveFromGroup = async (userToRemove) => {
    if (!window.confirm(`Remove ${userToRemove.name} from group?`)) return;
    try {
      const { data } = await API.put('/chat/groupremove', {
        chatId: selectedChat._id,
        userId: userToRemove._id,
      });
      if (userToRemove._id === user._id) {
        setSelectedChat(null);
        setShowGroupInfo(false);
        setChats((prev) => prev.filter((c) => c._id !== data._id));
      } else {
        setSelectedChat(data);
        setChats((prev) => prev.map((c) => (c._id === data._id ? data : c)));
      }
    } catch {
      toast.error('Failed to remove user from group');
    }
  };

  const handleAddMemberSearch = async (q) => {
    setAddMemberSearch(q);
    if (!q) return setAddMemberResults([]);
    try {
      const { data } = await API.get(`/users?search=${q}`);
      setAddMemberResults(data.users || data);
    } catch {
      setAddMemberResults([]);
    }
  };

  const handleAddToGroup = async (userToAdd) => {
    if (selectedChat.users.some((u) => u._id === userToAdd._id)) {
      return toast.warning('User is already a member');
    }
    try {
      const { data } = await API.put('/chat/groupadd', {
        chatId: selectedChat._id,
        userId: userToAdd._id,
      });
      setSelectedChat(data);
      setChats((prev) => prev.map((c) => (c._id === data._id ? data : c)));
      setAddMemberSearch('');
      setAddMemberResults([]);
      toast.success('Member added to group');
    } catch {
      toast.error('Failed to add member');
    }
  };

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '24px 16px', height: 'calc(100vh - 80px)' }}>
      {/* ── WhatsApp-Style Dual-Pane Container ── */}
      <div
        className="card"
        style={{
          display: 'flex',
          height: '100%',
          overflow: 'hidden',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* ════════════════ LEFT CHAT LIST (WhatsApp Sidebar) ════════════════ */}
        {(!isMobile || !selectedChat) && (
          <div
            style={{
              width: isMobile ? '100%' : '360px',
              flexShrink: 0,
              background: 'var(--color-surface)',
              borderRight: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            {/* Sidebar Top Header */}
            <div
              style={{
                height: 60,
                padding: '0 16px',
                background: 'var(--color-panel)',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar name={user?.name} img={user?.profileImage} size={36} />
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 16,
                    fontWeight: 800,
                    color: 'var(--color-text)',
                  }}
                >
                  Chats
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowBatchList((v) => !v);
                    if (!showBatchList) fetchBatches();
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0 10px', height: 30, fontSize: 11 }}
                  title="Browse graduation batch groups"
                >
                  <LuUsers size={13} /> {showBatchList ? 'Chats' : 'Batches'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowGroupModal(true)}
                  className="btn btn-icon"
                  style={{ width: 32, height: 32 }}
                  title="Create new group chat"
                >
                  <LuPlus size={16} />
                </button>
              </div>
            </div>

            {/* Search Input Bar */}
            <div style={{ padding: '10px 14px', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ position: 'relative' }}>
                <LuSearch
                  size={15}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)',
                  }}
                />
                <input
                  type="text"
                  placeholder="Search or start new chat"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="input-field"
                  style={{
                    paddingLeft: 36,
                    height: 36,
                    fontSize: 13,
                    borderRadius: 20,
                    background: 'var(--color-panel)',
                  }}
                />
              </div>
            </div>

            {/* Conversation List / Batch Directory */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {showBatchList ? (
                /* Batch Groups List */
                <div style={{ padding: '8px 0' }}>
                  <div style={{ padding: '8px 16px', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Graduation Batch Channels
                  </div>
                  {loadingBatches ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '30px 0' }}>
                      <div className="spinner" />
                    </div>
                  ) : batchGroups.length === 0 ? (
                    <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
                      No batch groups found.
                    </div>
                  ) : (
                    batchGroups.map((b) => (
                      <div
                        key={b._id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          borderBottom: '1px solid var(--color-border)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              background: 'rgba(224, 122, 63, 0.12)',
                              color: 'var(--color-accent)',
                              border: '1.5px solid rgba(224, 122, 63, 0.25)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <LuUsers size={18} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {b.chatName}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                              {b.users?.length || 0} members
                            </div>
                          </div>
                        </div>

                        {b.users?.some((u) => u._id === user._id) ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedChat(b);
                              setShowBatchList(false);
                            }}
                            className="btn btn-secondary btn-sm"
                            style={{ height: 28, fontSize: 11 }}
                          >
                            Open
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => joinBatch(b._id)}
                            className="btn btn-primary btn-sm"
                            style={{ height: 28, fontSize: 11 }}
                          >
                            Join
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              ) : (
                /* Regular Conversations */
                <div>
                  {loadingChats ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                      <div className="spinner" />
                    </div>
                  ) : (
                    (() => {
                      const matches = chats.filter((c) => {
                        if (!search) return true;
                        return getChatName(c).toLowerCase().includes(search.toLowerCase());
                      });

                      if (matches.length === 0 && !search) {
                        return (
                          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                            <LuMessageSquare size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 }}>
                              No messages yet
                            </p>
                            <p style={{ fontSize: 12.5, margin: 0 }}>
                              Search for an alumnus to start chatting.
                            </p>
                          </div>
                        );
                      }

                      return matches.map((c) => {
                        const active = selectedChat?._id === c._id;
                        const chatName = getChatName(c);
                        const chatImg = getChatImage(c);

                        return (
                          <div
                            key={c._id}
                            onClick={() => setSelectedChat(c)}
                            style={{
                              padding: '12px 16px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              cursor: 'pointer',
                              borderBottom: '1px solid var(--color-border)',
                              background: active ? 'rgba(224, 122, 63, 0.12)' : 'transparent',
                              borderLeft: active ? '4px solid var(--color-accent)' : '4px solid transparent',
                              transition: 'background-color 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              if (!active) e.currentTarget.style.background = 'var(--color-panel-hover)';
                            }}
                            onMouseLeave={(e) => {
                              if (!active) e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            {c.isGroupChat ? (
                              <div
                                style={{
                                  width: 44,
                                  height: 44,
                                  borderRadius: '50%',
                                  background: 'rgba(224, 122, 63, 0.12)',
                                  color: 'var(--color-accent)',
                                  border: '1.5px solid rgba(224, 122, 63, 0.25)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                <LuUsers size={20} />
                              </div>
                            ) : (
                              <Avatar name={chatName} img={chatImg} size={44} isOnline={true} />
                            )}

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
                                <div
                                  style={{
                                    fontSize: 14,
                                    fontWeight: active ? 700 : 600,
                                    color: 'var(--color-text)',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {chatName}
                                </div>
                                {c.latestMessage && (
                                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)', flexShrink: 0, marginLeft: 8 }}>
                                    {formatDistanceToNow(new Date(c.latestMessage.createdAt), { addSuffix: false })
                                      .replace('about ', '')
                                      .replace('less than a minute', 'now')}
                                  </span>
                                )}
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <p
                                  style={{
                                    fontSize: 12.5,
                                    color: c.unreadCount > 0 ? 'var(--color-text)' : 'var(--color-text-muted)',
                                    fontWeight: c.unreadCount > 0 ? 600 : 400,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    margin: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4,
                                  }}
                                >
                                  {c.latestMessage?.sender?._id === user?._id && (
                                    <LuCheckCheck size={14} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                                  )}
                                  {c.latestMessage ? c.latestMessage.content : 'No messages yet'}
                                </p>

                                {c.unreadCount > 0 && (
                                  <span
                                    style={{
                                      minWidth: 18,
                                      height: 18,
                                      borderRadius: 10,
                                      background: 'var(--color-accent)',
                                      color: '#FFFFFF',
                                      fontSize: 10,
                                      fontWeight: 800,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      padding: '0 5px',
                                      marginLeft: 6,
                                      flexShrink: 0,
                                    }}
                                  >
                                    {c.unreadCount}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()
                  )}

                  {/* Directory Search Extra Results */}
                  {search && searchResults.length > 0 && (
                    <div style={{ borderTop: '2px solid var(--color-border)', background: 'var(--color-panel)', padding: '8px 0' }}>
                      <div style={{ padding: '6px 16px', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                        Alumni Directory Matches
                      </div>
                      {searchResults.map((u) => (
                        <div
                          key={u._id}
                          onClick={() => accessChat(u._id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '10px 16px',
                            cursor: 'pointer',
                            borderBottom: '1px solid var(--color-border)',
                          }}
                        >
                          <Avatar name={u.name} img={u.profileImage} size={36} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)' }}>{u.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{u.department || u.role}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════ RIGHT ACTIVE CHAT PANEL (WhatsApp Chat) ════════════════ */}
        {(!isMobile || selectedChat) && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--color-page)',
              height: '100%',
              minWidth: 0,
            }}
          >
            {selectedChat ? (
              <>
                {/* Active Chat Header */}
                <div
                  style={{
                    height: 60,
                    padding: '0 20px',
                    background: 'var(--color-surface)',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    {isMobile && (
                      <button
                        type="button"
                        onClick={() => setSelectedChat(null)}
                        className="btn btn-icon"
                        style={{ width: 32, height: 32, marginRight: -4 }}
                      >
                        <LuArrowLeft size={18} />
                      </button>
                    )}

                    {selectedChat.isGroupChat ? (
                      <div
                        onClick={() => setShowGroupInfo(true)}
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          background: 'rgba(224, 122, 63, 0.12)',
                          color: 'var(--color-accent)',
                          border: '2px solid rgba(224, 122, 63, 0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <LuUsers size={20} />
                      </div>
                    ) : (
                      <Avatar
                        name={getChatName(selectedChat)}
                        img={getChatImage(selectedChat)}
                        size={44}
                        isOnline={true}
                        onClick={() => {
                          if (getChatImage(selectedChat)) setPreviewImage(getChatImage(selectedChat));
                        }}
                      />
                    )}

                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: 16,
                            fontWeight: 700,
                            color: 'var(--color-text)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {getChatName(selectedChat)}
                        </span>
                        {selectedChat.isGroupChat && (
                          <span
                            className="badge badge-accent"
                            style={{
                              padding: '2px 8px',
                              fontSize: 10.5,
                              background: 'rgba(224, 122, 63, 0.12)',
                              color: 'var(--color-accent)',
                              border: '1px solid rgba(224, 122, 63, 0.25)',
                            }}
                          >
                            Batch Group
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: 12, color: isTyping ? 'var(--color-accent)' : 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                        {isTyping ? (
                          'typing...'
                        ) : selectedChat.isGroupChat ? (
                          `${selectedChat.users?.length || 0} participants`
                        ) : (
                          <>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                            Online in Directory
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {selectedChat.isGroupChat ? (
                      <button
                        type="button"
                        onClick={() => setShowGroupInfo(true)}
                        className="btn btn-secondary btn-sm"
                        style={{ height: 32, fontSize: 12 }}
                      >
                        Group Info
                      </button>
                    ) : (
                      <Link
                        to={`/profile/${getChatUserId(selectedChat)}`}
                        className="btn btn-secondary btn-sm"
                        style={{ height: 32, fontSize: 12 }}
                      >
                        View Profile
                      </Link>
                    )}
                  </div>
                </div>

                {/* Messages Body (WhatsApp Wallpaper feel) */}
                <div
                  ref={messagesContainerRef}
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '20px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    background:
                      'radial-gradient(circle, var(--color-panel) 10%, transparent 11%) 0 0 / 24px 24px, var(--color-page)',
                  }}
                >
                  {/* Encrypted Notice Banner */}
                  <div style={{ textAlign: 'center', margin: '8px 0 16px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'var(--color-surface)',
                        padding: '4px 14px',
                        borderRadius: 14,
                        fontSize: 11,
                        color: 'var(--color-text-muted)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      <LuLock size={12} style={{ color: 'var(--color-accent)' }} />
                      Messages are encrypted & visible only to verified community members
                    </span>
                  </div>

                  {loadingMessages ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div className="spinner" />
                    </div>
                  ) : (
                    messages.map((m, i) => {
                      const isMine = m.sender?._id === user?._id;
                      const prevMessage = i > 0 ? messages[i - 1] : null;
                      const showDateDivider =
                        !prevMessage ||
                        new Date(m.createdAt).toDateString() !== new Date(prevMessage.createdAt).toDateString();

                      return (
                        <div key={m._id || i} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                          {showDateDivider && (
                            <div
                              style={{
                                alignSelf: 'center',
                                margin: '14px 0 8px',
                                background: 'var(--color-surface)',
                                border: '1px solid var(--color-border)',
                                padding: '3px 14px',
                                borderRadius: 12,
                                fontSize: 11,
                                fontWeight: 600,
                                color: 'var(--color-text-secondary)',
                                boxShadow: 'var(--shadow-sm)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                              }}
                            >
                              {getDateDividerLabel(m.createdAt)}
                            </div>
                          )}

                          <div
                            onContextMenu={(e) => handleContextMenu(e, m)}
                            style={{
                              alignSelf: isMine ? 'flex-end' : 'flex-start',
                              maxWidth: '78%',
                              display: 'flex',
                              flexDirection: 'row',
                              alignItems: 'flex-end',
                              gap: 8,
                            }}
                          >
                            {!isMine && (
                              <div
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: '50%',
                                  flexShrink: 0,
                                  background: m.sender?.profileImage
                                    ? `url(${m.sender.profileImage}) center/cover no-repeat`
                                    : 'var(--color-panel)',
                                  border: '2px solid var(--color-border)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontFamily: 'var(--font-heading)',
                                  fontSize: 12,
                                  fontWeight: 800,
                                  color: 'var(--color-text)',
                                  marginBottom: 2,
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                                }}
                                title={m.sender?.name}
                              >
                                {!m.sender?.profileImage && (m.sender?.name ? m.sender.name.slice(0, 2).toUpperCase() : '??')}
                              </div>
                            )}

                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: isMine ? 'flex-end' : 'flex-start',
                              }}
                            >
                              {!isMine && selectedChat.isGroupChat && (
                                <span
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: 'var(--color-accent)',
                                    marginBottom: 3,
                                    marginLeft: 4,
                                  }}
                                >
                                  {m.sender?.name}
                                </span>
                              )}

                              <div
                                style={{
                                  padding: '9px 14px 7px',
                                  borderRadius: isMine ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                                  background: isMine
                                    ? 'var(--color-accent)'
                                    : 'var(--color-surface)',
                                  color: isMine ? '#FFFFFF' : 'var(--color-text)',
                                  border: isMine ? 'none' : '1px solid var(--color-border)',
                                  boxShadow: isMine
                                    ? '0 3px 12px rgba(224, 122, 63, 0.28)'
                                    : 'var(--shadow-sm)',
                                  fontSize: 14,
                                  lineHeight: 1.5,
                                  wordBreak: 'break-word',
                                  position: 'relative',
                                }}
                              >
                                {/* Attachment if present */}
                                {m.fileUrl && !m.isDeleted && (
                                  <div style={{ marginBottom: 6 }}>
                                    {m.fileType?.startsWith('image/') || m.fileUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                                      <img
                                        src={m.fileUrl}
                                        alt="attachment"
                                        style={{
                                          maxWidth: '100%',
                                          maxHeight: 220,
                                          borderRadius: 8,
                                          cursor: 'pointer',
                                        }}
                                        onClick={() => setPreviewImage(m.fileUrl)}
                                      />
                                    ) : (
                                      <a
                                        href={m.fileUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 8,
                                          color: isMine ? '#FFFFFF' : 'var(--color-accent)',
                                          padding: '6px 10px',
                                          background: isMine ? 'rgba(0,0,0,0.15)' : 'var(--color-panel)',
                                          borderRadius: 6,
                                          fontSize: 13,
                                          textDecoration: 'none',
                                          fontWeight: 600,
                                        }}
                                      >
                                        <LuFileText size={16} />
                                        <span>Download Attachment</span>
                                      </a>
                                    )}
                                  </div>
                                )}

                                <div>{m.content}</div>

                                {/* Timestamp & Double Checkmarks */}
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end',
                                    gap: 4,
                                    marginTop: 4,
                                    fontSize: 10,
                                    color: isMine ? 'rgba(255,255,255,0.85)' : 'var(--color-text-muted)',
                                  }}
                                >
                                  <span>
                                    {new Date(m.createdAt).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                  {m.isEdited && <span>(edited)</span>}
                                  {isMine && <LuCheckCheck size={13} style={{ color: '#FFFFFF' }} />}
                                </div>
                              </div>
                            </div>

                            {isMine && (
                              <div
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: '50%',
                                  flexShrink: 0,
                                  background: user?.profileImage
                                    ? `url(${user.profileImage}) center/cover no-repeat`
                                    : 'var(--color-panel)',
                                  border: '2px solid var(--color-border)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontFamily: 'var(--font-heading)',
                                  fontSize: 12,
                                  fontWeight: 800,
                                  color: 'var(--color-text)',
                                  marginBottom: 2,
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                                }}
                                title={user?.name || 'You'}
                              >
                                {!user?.profileImage && (user?.name ? user.name.slice(0, 2).toUpperCase() : 'ME')}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Bottom Input Area */}
                <div
                  style={{
                    padding: '12px 18px',
                    background: 'var(--color-surface)',
                    borderTop: '1px solid var(--color-border)',
                  }}
                >
                  {editingMsgId && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '4px 10px',
                        background: 'var(--color-panel)',
                        borderRadius: 6,
                        fontSize: 12,
                        marginBottom: 8,
                        color: 'var(--color-accent)',
                      }}
                    >
                      <span>Editing message...</span>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--color-error)',
                          fontWeight: 600,
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {attachment && (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        background: 'var(--color-panel)',
                        padding: '4px 10px',
                        borderRadius: 8,
                        fontSize: 12,
                        marginBottom: 8,
                      }}
                    >
                      <LuFileText size={14} style={{ color: 'var(--color-accent)' }} />
                      <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {attachment.name}
                      </span>
                      <LuX
                        size={14}
                        style={{ cursor: 'pointer', color: 'var(--color-error)' }}
                        onClick={() => {
                          setAttachment(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn btn-icon"
                      title="Attach Document or Image"
                    >
                      <LuPaperclip size={18} />
                    </button>
                    <input
                      type="file"
                      hidden
                      ref={fileInputRef}
                      onChange={(e) => {
                        if (e.target.files[0]) setAttachment(e.target.files[0]);
                      }}
                    />

                    <input
                      ref={inputRef}
                      value={newMessage}
                      onChange={typingHandler}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message..."
                      className="input-field"
                      style={{
                        flex: 1,
                        height: 42,
                        borderRadius: 24,
                        padding: '0 16px',
                        background: 'var(--color-panel)',
                      }}
                    />

                    <button
                      type="button"
                      onClick={editingMsgId ? saveEdit : sendMessage}
                      disabled={(!newMessage.trim() && !attachment) || uploading}
                      className="btn btn-primary"
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: '50%',
                        padding: 0,
                        flexShrink: 0,
                      }}
                    >
                      {uploading ? <div className="spinner" style={{ width: 16, height: 16 }} /> : <LuSend size={16} />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* WhatsApp Web-Style Empty Desktop View */
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 40,
                  textAlign: 'center',
                  background: 'var(--color-page)',
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: 'rgba(224, 122, 63, 0.12)',
                    border: '1.5px solid rgba(224, 122, 63, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                    color: 'var(--color-accent)',
                  }}
                >
                  <LuMessageSquare size={36} strokeWidth={1.5} />
                </div>
                <h2
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 22,
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    marginBottom: 8,
                  }}
                >
                  Alumni Connect Web Messenger
                </h2>
                <p
                  style={{
                    fontSize: 14,
                    color: 'var(--color-text-secondary)',
                    maxWidth: 420,
                    lineHeight: 1.6,
                    marginBottom: 24,
                  }}
                >
                  Select a chat on the left or search across the NIT Jamshedpur directory to message batchmates, seniors, and alumni mentors.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-text-muted)' }}>
                  <LuLock size={12} style={{ color: 'var(--color-accent)' }} />
                  End-to-end encrypted on-platform communication
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── MODALS: Group Creation, Group Info, Report, Image Preview ── */}
      {showGroupModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: 420, padding: 28, background: 'var(--color-surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700 }}>New Group Chat</h3>
              <LuX size={20} style={{ cursor: 'pointer' }} onClick={() => setShowGroupModal(false)} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input
                type="text"
                placeholder="Group Subject / Title *"
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
                className="input-field"
              />

              <input
                type="text"
                placeholder="Add participants by name..."
                value={groupSearch}
                onChange={async (e) => {
                  const q = e.target.value;
                  setGroupSearch(q);
                  if (!q) return setGroupResults([]);
                  try {
                    const { data } = await API.get(`/users?search=${q}`);
                    setGroupResults(data.users || data);
                  } catch {}
                }}
                className="input-field"
              />

              {selectedUsers.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {selectedUsers.map((u) => (
                    <span key={u._id} className="badge badge-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      {u.name}
                      <LuX size={12} style={{ cursor: 'pointer' }} onClick={() => setSelectedUsers(selectedUsers.filter((s) => s._id !== u._id))} />
                    </span>
                  ))}
                </div>
              )}

              {groupResults.length > 0 && (
                <div style={{ maxHeight: 150, overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: 8 }}>
                  {groupResults.slice(0, 5).map((u) => (
                    <div
                      key={u._id}
                      onClick={() => {
                        setSelectedUsers((prev) => (prev.some((s) => s._id === u._id) ? prev : [...prev, u]));
                      }}
                      style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', borderBottom: '1px solid var(--color-border)' }}
                    >
                      <Avatar name={u.name} size={28} />
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{u.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button type="button" onClick={() => setShowGroupModal(false)} className="btn btn-secondary btn-md" style={{ flex: 1 }}>
                Cancel
              </button>
              <button type="button" onClick={handleSubmitGroup} className="btn btn-primary btn-md" style={{ flex: 1 }}>
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Info Modal */}
      {showGroupInfo && selectedChat?.isGroupChat && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: 440, padding: 28, background: 'var(--color-surface)', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700 }}>{selectedChat.chatName}</h3>
              <LuX size={20} style={{ cursor: 'pointer' }} onClick={() => setShowGroupInfo(false)} />
            </div>

            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
              {selectedChat.users?.length || 0} Participants
            </div>

            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: 8, padding: 8, marginBottom: 16 }}>
              {selectedChat.users?.map((u) => (
                <div key={u._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 6px', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={u.name} img={u.profileImage} size={32} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>{u.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{u.email}</div>
                    </div>
                  </div>
                  {selectedChat.groupAdmin?._id === u._id && (
                    <span className="badge badge-accent" style={{ fontSize: 10 }}>Admin</span>
                  )}
                </div>
              ))}
            </div>

            <button type="button" onClick={() => handleRemoveFromGroup(user)} className="btn btn-destructive btn-sm" style={{ alignSelf: 'center' }}>
              Leave Group
            </button>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 24, cursor: 'zoom-out' }}
        >
          <img src={previewImage} alt="preview" style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: 8 }} />
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            boxShadow: 'var(--shadow-md)',
            zIndex: 1500,
            overflow: 'hidden',
          }}
        >
          {contextMenu.msg.sender?._id === user?._id && !contextMenu.msg.isDeleted ? (
            <>
              <div
                onClick={() => startEditMenu(contextMenu.msg)}
                style={{ padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-panel)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                Edit Message
              </div>
              <div
                onClick={() => deleteMessage(contextMenu.msg._id)}
                style={{ padding: '8px 16px', fontSize: 13, cursor: 'pointer', color: 'var(--color-error)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-panel)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                Delete Message
              </div>
            </>
          ) : !contextMenu.msg.isDeleted ? (
            <div
              onClick={() => {
                setReportMessageId(contextMenu.msg._id);
                setShowReportModal(true);
              }}
              style={{ padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-panel)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              Report Message
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default Messages;
