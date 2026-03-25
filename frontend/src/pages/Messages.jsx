import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
    FaFlag, FaSearch, FaUsers, FaTimes, FaPaperPlane,
    FaPlus, FaCommentDots, FaPaperclip, FaFileAlt, FaArrowLeft
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import useIsMobile from '../hooks/useIsMobile';
import { formatDistanceToNow } from 'date-fns';

/* ── tokens ──────────────────────────────────────────────────────────────── */
const C = {
    blue: 'var(--blue, #203671)', blueDark: 'var(--blue-dark, #182858)', blueLight: 'var(--blue-light, #2D4899)',
    blueFaint: 'var(--blue-faint, rgba(32,54,113,0.12))', blueBorder: 'var(--blue-border, rgba(32,54,113,0.35))',
    white: 'var(--text-primary)', muted: 'var(--text-muted)', black: 'var(--text-primary, #000000)',
    darkBg: 'var(--bg)', darkCard: 'var(--bg-secondary)', darkBorder: 'var(--border)',
    danger: 'var(--danger)', dangerFaint: 'rgba(255, 77, 77, 0.1)',
    trueWhite: '#FFFFFF',
};

/* ── font / style injection ──────────────────────────────────────────────── */
if (typeof document !== 'undefined' && !document.getElementById('msg-styles')) {
    const l = document.createElement('link'); l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Sora:wght@700;800&display=swap';
    document.head.appendChild(l);
    const s = document.createElement('style'); s.id = 'msg-styles';
    s.textContent = `
        @keyframes fadeUp   { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn  { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        @keyframes blink    { 0%,80%,100%{opacity:0.2} 40%{opacity:1} }
        .chat-item { transition: background 0.2s, border-color 0.2s; border: 1px solid transparent; border-radius: 10px; }
        .chat-item:hover { background: rgba(32,54,113,0.1) !important; border-color: rgba(32,54,113,0.25) !important; }
        .msg-input:focus { border-color: #2D4899 !important; box-shadow: 0 0 0 3px rgba(32,54,113,0.12) !important; }
        .search-item:hover { background: rgba(32,54,113,0.1); }
        .msg-send-btn:hover { opacity: 0.85 !important; }
        .msg-scroll::-webkit-scrollbar { width: 4px; }
        .msg-scroll::-webkit-scrollbar-track { background: transparent; }
        .msg-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
        .msg-scroll::-webkit-scrollbar-thumb:hover { background: var(--blue-border); }
        
        .chat-item:hover { background: var(--blue-faint) !important; }
        .chat-item.active { background: var(--blue-faint) !important; border-left: 4px solid var(--blue-light) !important; }
        
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade { animation: fadeIn 0.3s ease-out forwards; }

        .msg-bubble { 
            max-width: 80%; padding: 10px 14px; border-radius: 12px; font-size: 14px; line-height: 1.5; 
            box-shadow: 0 1px 2px rgba(0,0,0,0.05); position: relative;
        }
        .msg-sent { background: var(--blue-light); color: #FFFFFF; border-bottom-right-radius: 2px; }
        .msg-received { background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border); border-bottom-left-radius: 2px; }
        .dot-typing span {
            display: inline-block; width: 5px; height: 5px; border-radius: 50%;
            background: #8A94A8; margin: 0 2px;
            animation: blink 1.4s infinite both;
        }
        .dot-typing span:nth-child(2) { animation-delay: 0.2s; }
        .dot-typing span:nth-child(3) { animation-delay: 0.4s; }
    `;
    document.head.appendChild(s);
}

const ENDPOINT = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '');
let socket, selectedChatCompare;

/* ── avatar helper ───────────────────────────────────────────────────────── */
const Avatar = ({ name = '', img, size = 40, gradient = false, onClick }) => (
    <div 
        onClick={onClick}
        style={{
            width: size, height: size, borderRadius: '50%', flexShrink: 0,
            background: gradient
                ? `linear-gradient(135deg, ${C.blueLight}, ${C.blueDark})`
                : C.blueFaint,
            border: `1px solid ${C.blueBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', 
            fontSize: size * 0.4, fontWeight: 700, 
            color: 'var(--text-primary)', // Dark letter
            fontFamily: "'Sora', sans-serif",
            backgroundImage: img ? `url(${img})` : undefined,
            backgroundSize: 'cover', backgroundPosition: 'center',
            cursor: onClick ? 'zoom-in' : 'default'
        }}
    >
        {!img && name.charAt(0).toUpperCase()}
    </div>
);

/* ── main ────────────────────────────────────────────────────────────────── */
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

    const [showGroupModal, setShowGroupModal] = useState(false);
    const [groupChatName, setGroupChatName] = useState('');
    const [groupSearch, setGroupSearch] = useState('');
    const [groupResults, setGroupResults] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);

    // group info
    const [showGroupInfo, setShowGroupInfo] = useState(location.state?.showGroupInfo || false);
    const [addMemberSearch, setAddMemberSearch] = useState('');
    // batch groups
    const [batchGroups, setBatchGroups] = useState([]);
    const [showBatchList, setShowBatchList] = useState(false);
    const [loadingBatches, setLoadingBatches] = useState(false);

    // reporting
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportMessageId, setReportMessageId] = useState(null);
    const [reportReason, setReportReason] = useState('');

    // editing
    const [editingMsgId, setEditingMsgId] = useState(null);

    // attachments
    const [attachment, setAttachment] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const fileInputRef = useRef(null);

    const messagesContainerRef = useRef(null);
    const inputRef = useRef(null);

    // context menu
    const [contextMenu, setContextMenu] = useState(null);

    // click-away for context menu
    useEffect(() => {
        const closeMenu = () => setContextMenu(null);
        document.addEventListener('click', closeMenu);
        return () => document.removeEventListener('click', closeMenu);
    }, []);

    const handleContextMenu = (e, m) => {
        e.preventDefault();
        setContextMenu({ x: e.pageX, y: e.pageY, msg: m });
    };

    /* ── helpers ── */
    const getChatName = c => {
        if (c.isGroupChat) return c.chatName;
        const recipient = c.users.find(u => u._id !== user._id) || c.users[0];
        return recipient._id === user._id ? "You" : recipient.name;
    };
    const getChatImage = c => c.isGroupChat ? null : (c.users[0]._id === user._id ? c.users[1].profileImage : c.users[0].profileImage);
    const getChatUserId = c => c.users[0]._id === user._id ? c.users[1]._id : c.users[0]._id;

    /* ── socket ── */
    useEffect(() => {
        if (!user?._id) return;
        
        socket = io(ENDPOINT, { 
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: 5
        });

        socket.emit('setup', user);
        socket.on('connected', () => setSocketConnected(true));
        socket.on('typing', () => setIsTyping(true));
        socket.on('stop typing', () => setIsTyping(false));

        socket.on('message recieved', newMessageRecieved => {
            if (!selectedChatCompare || selectedChatCompare._id !== newMessageRecieved.chat._id) {
                toast.info(`💬 ${newMessageRecieved.sender.name}: ${newMessageRecieved.content.slice(0, 40)}`);
                setChats(prev => {
                    const existing = prev.find(c => c._id === newMessageRecieved.chat._id);
                    if (existing) {
                        return prev.map(c => c._id === newMessageRecieved.chat._id 
                            ? { ...c, latestMessage: newMessageRecieved, unreadCount: (c.unreadCount || 0) + 1 } 
                            : c
                        ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                    }
                    fetchChats(); // fetch if new chat
                    return prev;
                });
            } else { 
                setMessages(prev => [...prev, newMessageRecieved]); 
                markChatAsRead(newMessageRecieved.chat._id);
            }
        });

        socket.on('message updated', updatedMsg => {
            if (selectedChatCompare && selectedChatCompare._id === updatedMsg.chat._id) {
                setMessages(prev => prev.map(m => m._id === updatedMsg._id ? updatedMsg : m));
            }
        });

        socket.on('message deleted', deletedMsg => {
            if (selectedChatCompare && selectedChatCompare._id === deletedMsg.chat._id) {
                setMessages(prev => prev.map(m => m._id === deletedMsg._id ? deletedMsg : m));
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
        window.scrollTo(0, 0);
        fetchChats(); 
    }, []);
    useEffect(() => { if (location.state?.userId) accessChat(location.state.userId); }, [location.state]);
    useEffect(() => { fetchMessages(); selectedChatCompare = selectedChat; if (selectedChat) markChatAsRead(selectedChat._id); }, [selectedChat]);
    useEffect(() => { if (messagesContainerRef.current) messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight; }, [messages]);

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
            setChats(prev => prev.find(c => c._id === data._id) ? prev : [data, ...prev]);
            setSelectedChat(data);
            setShowBatchList(false);
            toast.success('Joined batch group!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to join batch');
        }
    };

    const fetchChats = async () => {
        try { const { data } = await API.get('/chat'); setChats(data); }
        catch { toast.error('Failed to load chats'); }
        finally { setLoadingChats(false); }
    };

    const fetchMessages = async () => {
        if (!selectedChat) return;
        setLoadingMessages(true);
        try {
            const { data } = await API.get(`/message/${selectedChat._id}`);
            setMessages(data);
            socket.emit('join chat', selectedChat._id);
        } catch { toast.error('Failed to load messages'); }
        finally { setLoadingMessages(false); }
    };

    const markChatAsRead = async (chatId) => {
        try {
            await API.put(`/message/read/${chatId}`);
            setChats(prev => prev.map(c => c._id === chatId ? { ...c, unreadCount: 0 } : c));
        } catch (err) {
            console.error("Failed to mark messages as read", err);
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
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                socket.emit('new message', data);
                setMessages(prev => [...prev, data]);
                setNewMessage('');
                setAttachment(null);
            } catch { toast.error('Failed to send attachment'); }
            setUploading(false);
            return;
        }

        const msgText = newMessage.trim();
        setNewMessage('');
        
        // Optimistic UI update for text
        const tempId = Date.now().toString();
        const optimisticMsg = {
             _id: tempId,
             content: msgText,
             sender: user, 
             chat: selectedChat,
             createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, optimisticMsg]);
        
        try {
            const { data } = await API.post('/message', { content: msgText, chatId: selectedChat._id });
            socket.emit('new message', data);
            setMessages(prev => prev.map(msg => msg._id === tempId ? data : msg));
        } catch { 
            toast.error('Failed to send message'); 
            setMessages(prev => prev.filter(msg => msg._id !== tempId)); 
        }
    };

    const startEditMenu = (msg) => {
        setEditingMsgId(msg._id);
        setNewMessage(msg.content);
        inputRef.current?.focus();
        setContextMenu({ show: false, x: 0, y: 0, msg: null });
    };

    const cancelEdit = () => {
        setEditingMsgId(null);
        setNewMessage('');
    };

    const saveEdit = async () => {
        if (!newMessage.trim()) return cancelEdit();
        try {
            console.log("Saving edit for:", editingMsgId, "content:", newMessage);
            const { data } = await API.put(`/message/${editingMsgId}`, { content: newMessage });
            socket.emit('message updated', data);
            setMessages(prev => prev.map(m => m._id === data._id ? data : m));
            cancelEdit();
        } catch (err) { 
            console.error("Edit failed:", err);
            toast.error(err.response?.data?.message || "Failed to update message"); 
        }
    };

    const deleteMessage = async (msgId) => {
        if (!window.confirm("Are you sure you want to delete this message?")) return;
        try {
            const { data } = await API.delete(`/message/${msgId}`);
            socket.emit('message deleted', data);
            setMessages(prev => prev.map(m => m._id === data._id ? data : m));
        } catch { toast.error("Failed to delete message"); }
    };

    const handleKeyDown = e => { 
        if (e.key === 'Enter' && !e.shiftKey) { 
            e.preventDefault(); 
            if (editingMsgId) saveEdit();
            else sendMessage(); 
        } 
    };

    const typingHandler = e => {
        setNewMessage(e.target.value);
        if (!socketConnected) return;
        if (!typing) { setTyping(true); socket.emit('typing', selectedChat._id); }
        const last = Date.now();
        setTimeout(() => { if (Date.now() - last >= 3000 && typing) { socket.emit('stop typing', selectedChat._id); setTyping(false); } }, 3000);
    };

    const handleSearch = async q => {
        setSearch(q);
        if (!q) return setSearchResults([]);
        
        try { 
            const { data } = await API.get(`/users?search=${q}`); 
            const apiResults = data.users || data;
            
            // Filter out people who already have an active chat from the "Directory" results
            const directoryOnly = apiResults.filter(u => {
                const alreadyHasChat = chats.find(c => !c.isGroupChat && c.users.find(cu => cu._id === u._id));
                return !alreadyHasChat && u._id !== user._id;
            });
            
            setSearchResults(directoryOnly); 
        }
        catch { 
            setSearchResults([]);
            toast.error('Directory search failed'); 
        }
    };

    const handleGroupSearch = async q => {
        setGroupSearch(q);
        if (!q) return setGroupResults([]);
        try { const { data } = await API.get(`/users?search=${q}`); setGroupResults(data.users || data); }
        catch { toast.error('Search failed'); }
    };

    const accessChat = async userId => {
        try {
            const { data } = await API.post('/chat', { userId });
            setChats(prev => prev.find(c => c._id === data._id) ? prev : [data, ...prev]);
            setSelectedChat(data);
            setShowGroupModal(false);
            setSearch(''); setSearchResults([]);
        } catch { toast.error('Error fetching chat'); }
    };

    const handleSubmitGroup = async () => {
        if (!groupChatName || selectedUsers.length < 2) { toast.warning('Enter a name and add at least 2 users'); return; }
        try {
            const { data } = await API.post('/chat/group', { name: groupChatName, users: JSON.stringify(selectedUsers.map(u => u._id)) });
            setChats([data, ...chats]); setShowGroupModal(false);
            setSelectedUsers([]); setGroupChatName('');
            toast.success('Group chat created!');
        } catch { toast.error('Failed to create group chat'); }
    };

    const handleReportSubmit = async () => {
        if (!reportReason) return toast.warning('Provide a reason');
        try {
            await API.post('/message/report', { messageId: reportMessageId, reason: reportReason });
            toast.success('Message reported');
            setShowReportModal(false); setReportReason(''); setReportMessageId(null);
        } catch { toast.error('Failed to report'); }
    };

    const handleRemoveFromGroup = async (userToRemove) => {
        if (!window.confirm(`Remove ${userToRemove.name} from group?`)) return;
        try {
            const { data } = await API.put('/chat/groupremove', { chatId: selectedChat._id, userId: userToRemove._id });
            if (userToRemove._id === user._id) {
                setSelectedChat(null); setShowGroupInfo(false);
                setChats(prev => prev.filter(c => c._id !== data._id));
            } else {
                setSelectedChat(data); setChats(prev => prev.map(c => c._id === data._id ? data : c));
            }
        } catch { toast.error('Failed to remove user/leave group'); }
    };

    const handleAddMemberSearch = async q => {
        setAddMemberSearch(q);
        if (!q) return setAddMemberResults([]);
        try { const { data } = await API.get(`/users?search=${q}`); setAddMemberResults(data.users || data); }
        catch { toast.error('Search failed'); }
    };

    const handleAddToGroup = async (userToAdd) => {
        if (selectedChat.users.some(u => u._id === userToAdd._id)) return toast.warning('User already in group');
        try {
            const { data } = await API.put('/chat/groupadd', { chatId: selectedChat._id, userId: userToAdd._id });
            setSelectedChat(data); setChats(prev => prev.map(c => c._id === data._id ? data : c));
            setAddMemberSearch(''); setAddMemberResults([]);
            toast.success('User added');
        } catch { toast.error('Failed to add user'); }
    };

    const filteredChats = chats.filter(c => c.latestMessage || c.isGroupChat || selectedChat?._id === c._id);

    /* ── shared input style ── */
    const panelInput = {
        width: '100%', background: C.darkBg, border: `1px solid ${C.darkBorder}`,
        borderRadius: 9, padding: '9px 13px', color: C.white, fontSize: 13,
        outline: 'none', fontFamily: "'DM Sans', sans-serif",
        transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box',
    };

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px 48px', fontFamily: "'DM Sans', sans-serif", color: C.white }}>

            {/* page header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, gap: 15, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 16px rgba(32,54,113,0.5)` }}>
                        <FaCommentDots style={{ color: C.trueWhite, fontSize: 16 }} />
                    </div>
                    <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: C.white, margin: 0, letterSpacing: '-0.3px' }}>
                        Messages
                    </h1>
                </div>

                <button onClick={() => { setShowBatchList(!showBatchList); if (!showBatchList) fetchBatches(); }} style={{
                    padding: '8px 16px',
                    background: showBatchList ? C.blue : C.blueFaint,
                    border: `1px solid ${showBatchList ? C.blue : C.blueBorder}`, 
                    borderRadius: 9,
                    color: showBatchList ? C.trueWhite : C.blueLight,
                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8,
                    transition: 'all 0.2s',
                    fontFamily: "'DM Sans', sans-serif"
                }}
                    onMouseEnter={e => { if (!showBatchList) e.currentTarget.style.background = 'rgba(32,54,113,0.22)'; }}
                    onMouseLeave={e => { if (!showBatchList) e.currentTarget.style.background = C.blueFaint; }}
                >
                     {showBatchList ? <FaArrowLeft style={{ fontSize: 10 }} /> : <FaUsers style={{ fontSize: 13 }} />}
                     {showBatchList ? 'Back to Chats' : 'Browse Batch Groups'}
                </button>
            </div>

            <div style={{ display: 'flex', gap: isMobile ? 0 : 16, height: isMobile ? 'calc(100vh - 180px)' : '78vh', minHeight: 480 }}>

                {/* ════════════════ LEFT PANEL ════════════════ */}
                {(!isMobile || !selectedChat) && (
                <div style={{ width: isMobile ? '100%' : 300, flexShrink: 0, background: C.darkCard, border: `1px solid ${C.darkBorder}`, borderRadius: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                    {/* panel header */}
                    <div style={{ padding: '16px 16px 12px', borderBottom: `1px solid ${C.darkBorder}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: C.white }}>Chats</span>
                            <button onClick={() => setShowGroupModal(true)} style={{
                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                background: C.blueFaint, border: `1px solid ${C.blueBorder}`,
                                borderRadius: 7, padding: '5px 10px', color: C.blueLight,
                                fontSize: 11, fontWeight: 700, cursor: 'pointer',
                                fontFamily: "'DM Sans', sans-serif", transition: 'background 0.2s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(32,54,113,0.22)'}
                                onMouseLeave={e => e.currentTarget.style.background = C.blueFaint}
                            >
                                <FaPlus style={{ fontSize: 9 }} /> New Group
                            </button>
                        </div>

                        {/* search */}
                        <div style={{ position: 'relative' }}>
                            <FaSearch style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: C.muted, fontSize: 11, pointerEvents: 'none' }} />
                            <input
                                type="text" placeholder="Search users to chat…"
                                value={search} onChange={e => handleSearch(e.target.value)}
                                className="msg-input"
                                style={{ ...panelInput, paddingLeft: 30, fontSize: 12 }}
                            />
                        </div>
                    </div>

                    {/* chat list / batch list */}
                    <div className="msg-scroll" style={{ flex: 1, overflowY: 'auto' }}>
                        {showBatchList ? (
                            <div style={{ padding: '10px' }}>
                                {loadingBatches ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                                        <div style={{ width: 24, height: 24, borderRadius: '50%', border: `3px solid ${C.blueFaint}`, borderTopColor: C.blueLight, animation: 'spin 0.7s linear infinite' }} />
                                    </div>
                                ) : batchGroups.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '40px 16px', color: C.muted, fontSize: 12.5 }}>No batch groups found.</div>
                                ) : (
                                    batchGroups.map(b => (
                                        <div key={b._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '12px 10px', borderBottom: `1px solid ${C.darkBorder}` }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                                                <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: `linear-gradient(135deg, ${C.blue}, ${C.blueDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <FaUsers style={{ color: C.trueWhite, fontSize: 13 }} />
                                                </div>
                                                <div style={{ minWidth: 0 }}>
                                                    <p style={{ fontSize: 13, fontWeight: 700, color: C.white, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.chatName}</p>
                                                    <p style={{ fontSize: 10.5, color: C.muted, margin: 0 }}>{b.users.length} members</p>
                                                </div>
                                            </div>
                                            {b.users.some(u => u._id === user._id) ? (
                                                <button onClick={() => { setSelectedChat(b); setShowBatchList(false); }} style={{ background: C.blueFaint, border: `1px solid ${C.blueBorder}`, borderRadius: 6, padding: '4px 8px', color: C.blueLight, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>Open</button>
                                            ) : (
                                                <button onClick={() => joinBatch(b._id)} style={{ background: C.blue, border: 'none', borderRadius: 6, padding: '4px 10px', color: C.trueWhite, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>Join</button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Existing Chats (Filtered if searching) */}
                                <div style={{ padding: '0 0 12px' }}>
                                    {loadingChats ? (
                                        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                                            <div style={{ width: 24, height: 24, borderRadius: '50%', border: `3px solid ${C.blueFaint}`, borderTopColor: C.blueLight, animation: 'spin 0.7s linear infinite' }} />
                                        </div>
                                    ) : (
                                        (() => {
                                            const matches = chats.filter(c => {
                                                if (!search) return true;
                                                const name = getChatName(c).toLowerCase();
                                                return name.includes(search.toLowerCase());
                                            });

                                            if (matches.length === 0 && !search) {
                                                return (
                                                    <div style={{ textAlign: 'center', padding: '40px 16px', color: C.muted, fontSize: 12.5 }}>
                                                        No chats yet.<br />Search for a user to start.
                                                    </div>
                                                );
                                            }

                                            return matches.map(c => {
                                                const active = selectedChat?._id === c._id;
                                                const chatName = getChatName(c);
                                                const chatImage = getChatImage(c);
                                                
                                                return (
                                                    <div 
                                                        key={c._id} 
                                                        onClick={() => setSelectedChat(c)}
                                                        className={`chat-item ${active ? 'active' : ''}`}
                                                        style={{ 
                                                            padding: '12px 14px', cursor: 'pointer', display: 'flex', gap: 12, 
                                                            transition: 'all 0.2s', borderLeft: '4px solid transparent',
                                                            background: active ? 'var(--blue-faint)' : 'transparent',
                                                            borderBottom: '1px solid var(--border)'
                                                        }}
                                                    >
                                                        {c.isGroupChat 
                                                            ? <div style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, background: `linear-gradient(135deg, ${C.blue}, ${C.blueDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <FaUsers style={{ color: C.trueWhite, fontSize: 15 }} />
                                                            </div>
                                                            : <Avatar name={chatName} img={chatImage} size={38} />
                                                        }
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                                                                <p style={{ fontSize: 13, fontWeight: active ? 700 : 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
                                                                    {chatName}
                                                                </p>
                                                                {c.latestMessage && (
                                                                    <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>
                                                                        {formatDistanceToNow(new Date(c.latestMessage.createdAt), { addSuffix: false }).replace('about ', '').replace('less than a minute', 'now')}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                                <p style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0, flex: 1 }}>
                                                                    {c.latestMessage ? (
                                                                        <>
                                                                            <span style={{ fontWeight: 600 }}>{c.latestMessage.sender.name === user.name ? 'You' : c.latestMessage.sender.name}:</span>{' '}
                                                                            {c.latestMessage.content}
                                                                        </>
                                                                    ) : 'No messages yet'}
                                                                </p>
                                                                {c.unreadCount > 0 && (
                                                                    <div style={{ 
                                                                        minWidth: 18, height: 18, borderRadius: 10, 
                                                                        background: 'var(--blue-light)', color: '#fff', 
                                                                        fontSize: 10, fontWeight: 800, display: 'flex', 
                                                                        alignItems: 'center', justifyContent: 'center',
                                                                        padding: '0 5px', marginLeft: 8, boxShadow: '0 2px 6px rgba(32,54,113,0.3)'
                                                                    }}>
                                                                        {c.unreadCount}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            });
                                        })()
                                    )}
                                </div>

                                {/* Directory Results (Only if searching) */}
                                {search && searchResults.length > 0 && (
                                    <div style={{ padding: '12px 0', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                                        <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 14px', marginBottom: 12 }}>
                                            From Directory
                                        </p>
                                        {searchResults.map(u => (
                                            <div 
                                                key={u._id} 
                                                onClick={() => accessChat(u._id)}
                                                className="chat-item"
                                                style={{ padding: '10px 14px', cursor: 'pointer', display: 'flex', gap: 12, transition: 'all 0.2s', alignItems: 'center' }}
                                            >
                                                <Avatar name={u.name} img={u.profileImage} size={34} />
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{u.name}</p>
                                                    <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0, textTransform: 'capitalize' }}>{u.role}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
                )}

                {/* ════════════════ RIGHT PANEL ════════════════ */}
                {(!isMobile || selectedChat) && (
                <div style={{ flex: 1, background: C.darkCard, border: `1px solid ${C.darkBorder}`, borderRadius: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

                    {selectedChat ? (
                        <>
                            {/* chat header */}
                            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.darkBorder}`, display: 'flex', alignItems: 'center', gap: 12, background: C.darkCard }}>
                                {isMobile && (
                                    <button onClick={() => setSelectedChat(null)} style={{ background: 'none', border: 'none', color: C.white, cursor: 'pointer', padding: '0 8px 0 0', display: 'flex', alignItems: 'center' }}>
                                        <FaArrowLeft style={{ fontSize: 16 }} />
                                    </button>
                                )}
                                {selectedChat.isGroupChat
                                    ? <div onClick={() => setShowGroupInfo(true)} style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, background: `linear-gradient(135deg, ${C.blue}, ${C.blueDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                        <FaUsers style={{ color: C.trueWhite, fontSize: 15 }} />
                                    </div>
                                    : <Avatar name={getChatName(selectedChat)} img={getChatImage(selectedChat)} size={38} gradient onClick={() => { if (getChatImage(selectedChat)) setPreviewImage(getChatImage(selectedChat)); }} />
                                }
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        {selectedChat.isGroupChat ? (
                                            <h3 onClick={() => setShowGroupInfo(true)} style={{ cursor: 'pointer', fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: C.white, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {getChatName(selectedChat)}
                                            </h3>
                                        ) : (
                                            <Link to={`/profile/${getChatUserId(selectedChat)}`} state={{ from: '/messages' }}
                                                style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: C.white, textDecoration: 'none', transition: 'color 0.2s' }}
                                                onMouseEnter={e => e.currentTarget.style.color = C.blueLight}
                                                onMouseLeave={e => e.currentTarget.style.color = C.white}
                                            >
                                                {getChatName(selectedChat)}
                                            </Link>
                                        )}
                                        {selectedChat.isGroupChat && <span style={{ background: C.blueFaint, color: C.blueLight, fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' }}>Group</span>}
                                    </div>
                                    <p style={{ fontSize: 11, color: C.muted, margin: 0, marginTop: 1 }}>
                                        {selectedChat.isGroupChat ? `${selectedChat.users.length} members` : 'Alumni Member'}
                                    </p>
                                </div>
                            </div>

                            {/* messages */}
                            <div className="msg-scroll" ref={messagesContainerRef} style={{ flex: 1, overflowY: 'auto', padding: '20px', background: C.darkBg, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {loadingMessages ? (
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid ${C.blueFaint}`, borderTopColor: C.blueLight, animation: 'spin 0.7s linear infinite' }} />
                                    </div>
                                ) : messages.map((m, i) => {
                                    const isMine = m.sender._id === user._id;
                                    const prevSame = i > 0 && messages[i - 1].sender._id === m.sender._id;
                                    const nextSame = i < messages.length - 1 && messages[i + 1].sender._id === m.sender._id;
                                    return (
                                        <div key={m._id} onContextMenu={e => handleContextMenu(e, m)} style={{ display: 'flex', gap: '12px', alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '75%', marginTop: prevSame ? '2px' : '16px', position: 'relative' }} className="msg-row">
                                            {!isMine && (
                                                <div style={{ width: '32px', flexShrink: 0, display: 'flex', alignItems: 'flex-end' }}>
                                                    {!nextSame && (
                                                        <Avatar 
                                                            name={m.sender?.name} 
                                                            img={m.sender?.profileImage} 
                                                            size={32} 
                                                            onClick={() => { if (m.sender?.profileImage) setPreviewImage(m.sender?.profileImage); }} 
                                                        />
                                                    )}
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                                                {!prevSame && selectedChat.isGroupChat && (
                                                    <span style={{ 
                                                        fontSize: '11px', 
                                                        fontWeight: 700,
                                                        color: isMine ? C.blueLight : C.muted, 
                                                        marginBottom: '2px', 
                                                        marginLeft: isMine ? '0' : '4px',
                                                        marginRight: isMine ? '4px' : '0',
                                                        display: 'block'
                                                    }}>
                                                        {isMine ? 'You' : m.sender?.name}
                                                    </span>
                                                )}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexDirection: isMine ? 'row-reverse' : 'row' }}>
                                                    <div style={{ background: isMine ? C.blueLight : C.darkCard, color: m.isDeleted ? C.muted : (isMine ? C.trueWhite : C.white), fontStyle: m.isDeleted ? 'italic' : 'normal', padding: '10px 14px', borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px', fontSize: '14px', lineHeight: '1.4', wordBreak: 'break-word', border: `1px solid ${C.darkBorder}` }}>
                                                        {m.fileUrl && !m.isDeleted && (
                                                            <div style={{ marginBottom: m.content ? '8px' : '0' }}>
                                                                {m.fileType?.startsWith('image/') || m.fileUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                                                                    <img src={m.fileUrl} alt="attachment" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', cursor: 'zoom-in' }} onClick={() => setPreviewImage(m.fileUrl)} />
                                                                ) : (
                                                                    <a href={m.fileUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isMine ? C.trueWhite : C.blueLight, textDecoration: 'none', background: 'rgba(0,0,0,0.1)', padding: '8px 12px', borderRadius: '8px' }}>
                                                                        <FaFileAlt />
                                                                        <span style={{ textDecoration: 'underline' }}>View Attachment</span>
                                                                    </a>
                                                                )}
                                                            </div>
                                                        )}
                                                        {m.content}
                                                        {m.isEdited && !m.isDeleted && <span style={{ fontSize: '10px', color: C.muted, marginLeft: '6px' }}>(edited)</span>}
                                                    </div>
                                                </div>
                                                {!nextSame && <span style={{ fontSize: '11px', color: C.muted, marginTop: '4px', marginRight: isMine ? '4px' : '0', marginLeft: isMine ? '0' : '4px' }}>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                                            </div>
                                        </div>
                                    );
                                })}

                                {isTyping && (
                                    <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'flex-end' }}>
                                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.blueFaint, border: `1px solid ${C.blueBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: C.blueLight }}>…</div>
                                        <div style={{ background: C.darkCard, border: `1px solid ${C.darkBorder}`, borderRadius: '18px 18px 18px 4px', padding: '10px 16px' }}>
                                            <div className="dot-typing">
                                                <span /><span /><span />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* message input */}
                            <div style={{ padding: '16px 20px', borderTop: `1px solid ${C.darkBorder}`, background: C.darkCard }}>
                                {isTyping ? <div style={{ fontSize: '12px', color: C.blueLight, marginBottom: '8px', fontStyle: 'italic' }}>Someone is typing...</div> : <div style={{ height: '26px' }} />}
                                {editingMsgId && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: C.blueLight, marginBottom: '4px', paddingLeft: '4px' }}>
                                        <span>Editing message...</span>
                                        <span onClick={cancelEdit} style={{ cursor: 'pointer', color: C.danger }}>Cancel</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: '12px', background: C.darkBg, padding: '8px 16px', borderRadius: '24px', border: `1px solid ${C.darkBorder}`, alignItems: 'center' }}>
                                    <button onClick={() => fileInputRef.current?.click()} style={{ background: 'none', border: 'none', color: attachment ? C.blueLight : C.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '16px' }} title="Attach file">
                                        <FaPaperclip />
                                    </button>
                                    <input type="file" hidden ref={fileInputRef} onChange={e => { if (e.target.files[0]) setAttachment(e.target.files[0]); }} />
                                    
                                    {attachment && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: C.darkCard, padding: '4px 10px', borderRadius: '12px', fontSize: '12px', color: C.white }}>
                                            <FaFileAlt style={{ color: C.blueLight }} />
                                            <span style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{attachment.name}</span>
                                            <FaTimes style={{ cursor: 'pointer', color: C.danger, marginLeft: '4px' }} onClick={() => { setAttachment(null); fileInputRef.current.value = ''; }} />
                                        </div>
                                    )}
                                    <input
                                        ref={inputRef}
                                        value={newMessage}
                                        onChange={typingHandler}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Type a message..."
                                        style={{ flex: 1, background: 'transparent', border: 'none', color: C.white, outline: 'none', fontSize: '14px', display: attachment ? 'none' : 'block' }}
                                    />
                                    {attachment && <div style={{ flex: 1 }} />} {/* spacer if attachment present but text is hidden or maybe user still wants caption? Let's show both */}
                                    <button
                                        onClick={editingMsgId ? saveEdit : sendMessage}
                                        disabled={(!newMessage.trim() && !attachment) || uploading}
                                        style={{ background: (newMessage.trim() || attachment) ? C.blueLight : C.darkBorder, color: C.trueWhite, border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: ((newMessage.trim() || attachment) && !uploading) ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}
                                    >
                                        {uploading ? <div style={{ width: '12px', height: '12px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <FaPaperPlane style={{ color: C.trueWhite, fontSize: 13 }} />}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* empty state */
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 40 }}>
                            <div style={{ width: 72, height: 72, borderRadius: 20, background: C.blueFaint, border: `1px solid ${C.blueBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FaCommentDots style={{ color: C.blueLight, fontSize: 30 }} />
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 17, fontWeight: 700, color: C.white, margin: '0 0 8px' }}>Your Messages</p>
                                <p style={{ fontSize: 13.5, color: C.muted, margin: 0 }}>Select a conversation or search for an alumni to start chatting.</p>
                            </div>
                        </div>
                    )}
                </div>
                )}
            </div>

            {/* ════════════════ GROUP MODAL ════════════════ */}
            {showGroupModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
                    <div style={{ background: C.darkCard, border: `1px solid ${C.darkBorder}`, borderRadius: 18, padding: 28, width: '100%', maxWidth: 400, boxShadow: '0 32px 80px rgba(0,0,0,0.7)', animation: 'fadeUp 0.25s ease both' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 9, background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FaUsers style={{ color: C.trueWhite, fontSize: 15 }} />
                                </div>
                                <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 700, color: C.white, margin: 0 }}>Create Group Chat</p>
                            </div>
                            <button onClick={() => setShowGroupModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 16, padding: 4 }}>
                                <FaTimes />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <input type="text" placeholder="Group name *" value={groupChatName} onChange={e => setGroupChatName(e.target.value)}
                                style={{ ...panelInput }} onFocus={e => { e.target.style.borderColor = C.blueLight; e.target.style.boxShadow = `0 0 0 3px ${C.blueFaint}`; }} onBlur={e => { e.target.style.borderColor = C.darkBorder; e.target.style.boxShadow = 'none'; }} />

                            <div style={{ position: 'relative' }}>
                                <FaSearch style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: C.muted, fontSize: 11, pointerEvents: 'none' }} />
                                <input type="text" placeholder="Add users by name…" value={groupSearch} onChange={e => handleGroupSearch(e.target.value)}
                                    style={{ ...panelInput, paddingLeft: 30 }} onFocus={e => { e.target.style.borderColor = C.blueLight; e.target.style.boxShadow = `0 0 0 3px ${C.blueFaint}`; }} onBlur={e => { e.target.style.borderColor = C.darkBorder; e.target.style.boxShadow = 'none'; }} />
                            </div>

                            {/* selected users pills */}
                            {selectedUsers.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {selectedUsers.map(u => (
                                        <span key={u._id} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: C.blueFaint, border: `1px solid ${C.blueBorder}`, borderRadius: 20, padding: '4px 10px', fontSize: 12, color: C.blueLight, fontWeight: 600 }}>
                                            {u.name}
                                            <FaTimes style={{ fontSize: 9, cursor: 'pointer' }} onClick={() => setSelectedUsers(selectedUsers.filter(s => s._id !== u._id))} />
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* group search results */}
                            {groupResults.length > 0 && (
                                <div style={{ background: C.darkBg, border: `1px solid ${C.darkBorder}`, borderRadius: 9, overflow: 'hidden', maxHeight: 160, overflowY: 'auto' }}>
                                    {groupResults.slice(0, 5).map(u => (
                                        <div key={u._id} onClick={() => { setSelectedUsers(prev => prev.some(s => s._id === u._id) ? prev : [...prev, u]); }}
                                            className="search-item"
                                            style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px', cursor: 'pointer', borderBottom: `1px solid ${C.darkBorder}`, transition: 'background 0.15s' }}>
                                            <Avatar name={u.name} size={28} gradient />
                                            <p style={{ fontSize: 13, fontWeight: 600, color: C.white, margin: 0 }}>{u.name}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
                            <button onClick={() => setShowGroupModal(false)} style={{ flex: 1, background: 'transparent', border: `1px solid ${C.darkBorder}`, borderRadius: 9, padding: '10px 0', color: C.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'border-color 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = C.blueBorder}
                                onMouseLeave={e => e.currentTarget.style.borderColor = C.darkBorder}
                            >Cancel</button>
                            <button onClick={handleSubmitGroup} style={{ flex: 1, background: `linear-gradient(135deg, ${C.blueLight}, ${C.blue})`, border: 'none', borderRadius: 9, padding: '10px 0', color: C.white, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: `0 3px 12px rgba(32,54,113,0.4)`, transition: 'opacity 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                            >Create Group</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════ GROUP INFO MODAL ════════════════ */}
            {showGroupInfo && selectedChat?.isGroupChat && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
                    <div style={{ background: C.darkCard, border: `1px solid ${C.darkBorder}`, borderRadius: 18, padding: 28, width: '100%', maxWidth: 400, boxShadow: '0 32px 80px rgba(0,0,0,0.7)', animation: 'fadeUp 0.25s ease both', display: 'flex', flexDirection: 'column', maxHeight: '80vh' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                            <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, color: C.white, margin: 0 }}>{selectedChat.chatName}</p>
                            <button onClick={() => { setShowGroupInfo(false); setAddMemberSearch(''); setAddMemberResults([]); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 16 }}>
                                <FaTimes />
                            </button>
                        </div>

                        <p style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>{selectedChat.users.length} Members</p>
                        
                        <div style={{ flex: 1, overflowY: 'auto', background: C.darkBg, border: `1px solid ${C.darkBorder}`, borderRadius: 12, padding: 8, marginBottom: 16 }}>
                            {selectedChat.users.map(u => (
                                <div key={u._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', borderBottom: `1px solid ${C.darkBorder}` }}>
                                    <Link to={`/profile/${u._id}`} state={{ from: '/messages', selectedChat: selectedChat, showGroupInfo: true }} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                                        <Avatar name={u.name} img={u.profileImage} size={32} />
                                        <div>
                                            <p style={{ fontSize: 13, fontWeight: 600, color: C.white, margin: 0, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = C.blueLight} onMouseLeave={e => e.currentTarget.style.color = C.white}>{u.name}</p>
                                            <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{u.email}</p>
                                        </div>
                                    </Link>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {selectedChat.groupAdmin?._id === u._id && (
                                            <span style={{ fontSize: 10, background: C.blueFaint, color: C.blueLight, padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>Admin</span>
                                        )}
                                        {selectedChat.groupAdmin?._id === user._id && u._id !== user._id && (
                                            <button onClick={() => handleRemoveFromGroup(u)} style={{ background: 'none', border: 'none', color: C.danger, cursor: 'pointer', fontSize: 12 }} title="Remove user"><FaTimes /></button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {selectedChat.groupAdmin?._id === user._id && (
                            <div style={{ marginBottom: 16, position: 'relative' }}>
                                <input type="text" placeholder="Add user to group..." value={addMemberSearch} onChange={e => handleAddMemberSearch(e.target.value)} style={{ ...panelInput }} />
                                {addMemberSearch && addMemberResults.length > 0 && (
                                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: C.darkCard, border: `1px solid ${C.darkBorder}`, borderRadius: 8, marginTop: 4, maxHeight: 150, overflowY: 'auto', zIndex: 10 }}>
                                        {addMemberResults.slice(0, 5).map(u => (
                                            <div key={u._id} onClick={() => handleAddToGroup(u)} className="search-item" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', cursor: 'pointer', borderBottom: `1px solid ${C.darkBorder}` }}>
                                                <Avatar name={u.name} img={u.profileImage} size={24} onClick={() => { if (u.profileImage) setPreviewImage(u.profileImage); }} />
                                                <span style={{ fontSize: 13, color: C.white }}>{u.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <button onClick={() => handleRemoveFromGroup(user)} style={{ background: C.dangerFaint, border: `1px solid rgba(255,77,77,0.3)`, color: C.danger, padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                                Leave Group
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════ REPORT MODAL ════════════════ */}
            {showReportModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
                    <div style={{ background: C.darkCard, border: `1px solid ${C.darkBorder}`, borderRadius: 18, padding: 28, width: '100%', maxWidth: 380, boxShadow: '0 32px 80px rgba(0,0,0,0.7)', animation: 'fadeUp 0.25s ease both' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 9, background: C.dangerFaint, border: `1px solid rgba(255,77,77,0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FaFlag style={{ color: C.danger, fontSize: 14 }} />
                                </div>
                                <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 700, color: C.white, margin: 0 }}>Report Message</p>
                            </div>
                            <button onClick={() => { setShowReportModal(false); setReportReason(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 16, padding: 4 }}>
                                <FaTimes />
                            </button>
                        </div>

                        <p style={{ fontSize: 13, color: C.muted, margin: '0 0 14px' }}>Describe why this message violates community guidelines.</p>

                        <textarea placeholder="Reason for reporting…" value={reportReason} onChange={e => setReportReason(e.target.value)} rows={4}
                            style={{ ...panelInput, resize: 'vertical', lineHeight: 1.6, minHeight: 100 }}
                            onFocus={e => { e.target.style.borderColor = C.blueLight; e.target.style.boxShadow = `0 0 0 3px ${C.blueFaint}`; }}
                            onBlur={e => { e.target.style.borderColor = C.darkBorder; e.target.style.boxShadow = 'none'; }}
                        />

                        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                            <button onClick={() => { setShowReportModal(false); setReportReason(''); }} style={{ flex: 1, background: 'transparent', border: `1px solid ${C.darkBorder}`, borderRadius: 9, padding: '10px 0', color: C.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'border-color 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = C.blueBorder}
                                onMouseLeave={e => e.currentTarget.style.borderColor = C.darkBorder}
                            >Cancel</button>
                            <button onClick={handleReportSubmit} style={{ flex: 1, background: `linear-gradient(135deg, #e03333, ${C.danger})`, border: 'none', borderRadius: 9, padding: '10px 0', color: C.white, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: `0 3px 12px rgba(255,77,77,0.3)`, transition: 'opacity 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                            >Submit Report</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════ CONTEXT MENU ════════════════ */}
            {contextMenu && (
                <div style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, background: C.darkCard, border: `1px solid ${C.darkBorder}`, borderRadius: '8px', zIndex: 1000, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', minWidth: '150px' }}>
                    {contextMenu.msg.sender._id === user._id && !contextMenu.msg.isDeleted ? (
                        <>
                            <div style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center', transition: 'background 0.2s', color: C.white }} onClick={() => startEditMenu(contextMenu.msg)} className="search-item">
                                <span style={{ fontSize: '12px' }}></span> Edit 
                            </div>
                            <div style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center', transition: 'background 0.2s', color: C.danger }} onClick={() => deleteMessage(contextMenu.msg._id)} className="search-item">
                                <span style={{ fontSize: '12px' }}></span>Delete
                            </div>
                        </>
                    ) : !contextMenu.msg.isDeleted ? (
                        <div style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center', transition: 'background 0.2s', color: C.white }} onClick={() => { setReportMessageId(contextMenu.msg._id); setShowReportModal(true); }} className="search-item">
                            <span style={{ fontSize: '12px' }}>⚠️</span> Report Message
                        </div>
                    ) : null}
                </div>
            )}
            {/* ════════════════ IMAGE PREVIEW ════════════════ */}
            {previewImage && (
                <div onClick={() => setPreviewImage(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 40, cursor: 'zoom-out' }}>
                    <img src={previewImage} alt="preview" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 12, boxShadow: '0 40px 100px rgba(0,0,0,0.8)', animation: 'fadeUp 0.3s ease' }} />
                    <FaTimes style={{ position: 'absolute', top: 30, right: 30, color: '#fff', fontSize: 28, cursor: 'pointer', opacity: 0.7 }} onClick={() => setPreviewImage(null)} />
                </div>
            )}
        </div>
    );
};

export default Messages;