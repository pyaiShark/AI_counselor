import { useState, useEffect, useRef } from 'react';
import { Title } from '../components/tailus-ui/typography';
import { sendChatMessage, getChatHistory, getChatSessions, createChatSession, updateChatSession, deleteChatSession } from '../api';
import ChatBubble from '../components/ChatBubble';
import Button from '../components/tailus-ui/Button';
import { useNavigate } from 'react-router-dom';

const AICounselor = () => {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default open on desktop
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    const [editingSessionId, setEditingSessionId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [modal, setModal] = useState(null); // { title: string, message: string, onConfirm: func }

    // Initial Load
    useEffect(() => {
        loadSessions();
        if (window.innerWidth < 768) setIsSidebarOpen(false);
    }, []);

    // Load messages when session changes
    useEffect(() => {
        if (currentSessionId) {
            loadHistory(currentSessionId);
            if (window.innerWidth < 768) setIsSidebarOpen(false);
        }
    }, [currentSessionId]);

    // Scroll to bottom on new messages
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [input]);

    const loadSessions = async () => {
        try {
            const data = await getChatSessions();
            const sessionList = Array.isArray(data.data) ? data.data : [];
            setSessions(sessionList);

            if (sessionList.length > 0 && !currentSessionId) {
                setCurrentSessionId(sessionList[0].id);
            } else if (sessionList.length === 0) {
                handleNewChat();
            }
        } catch (error) {
            console.error("Failed to load sessions", error);
        }
    };

    const loadHistory = async (sessionId) => {
        try {
            setLoading(true);
            const history = await getChatHistory(sessionId);
            setMessages(history.data);
        } catch (error) {
            console.error("Failed to load history", error);
        } finally {
            setLoading(false);
        }
    };

    const handleNewChat = async () => {
        try {
            setLoading(true);
            const newSession = await createChatSession();
            const sessionData = newSession.data || newSession;
            setSessions(prev => [sessionData, ...prev]);
            setCurrentSessionId(sessionData.id);
            // After setting session ID, loadHistory will be triggered by useEffect
        } catch (error) {
            console.error("Failed to create session", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (text = input) => {
        if (!text.trim() || !currentSessionId) return;
        const userMsg = { sender: 'user', message: text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const response = await sendChatMessage(text, currentSessionId);
            const aiMsg = {
                sender: 'ai',
                message: response.data.response,
                suggested_actions: response.data.suggested_actions
            };
            setMessages(prev => [...prev, aiMsg]);
            if (response.data.session_title) {
                setSessions(prev => prev.map(s =>
                    s.id === currentSessionId ? { ...s, title: response.data.session_title } : s
                ));
            }
        } catch (error) {
            // console.error("Failed to send message", error);
            setMessages(prev => [...prev, { sender: 'ai', message: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleRename = async (sessionId) => {
        if (!editTitle.trim()) {
            setEditingSessionId(null);
            return;
        }
        try {
            await updateChatSession(sessionId, editTitle);
            setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, title: editTitle } : s));
            setEditingSessionId(null);
        } catch (error) {
            console.error("Failed to rename session", error);
        }
    };

    const handleDelete = async (e, sessionId) => {
        e.stopPropagation();
        const sessionToDelete = sessions.find(s => s.id === sessionId);

        setModal({
            title: 'Delete Chat?',
            message: `Are you sure you want to delete "${sessionToDelete?.title || 'this chat'}"?`,
            subMessage: "This action cannot be undone and all messages will be lost.",
            confirmText: "Delete Chat",
            onConfirm: async () => {
                setModal(null);
                try {
                    await deleteChatSession(sessionId);
                    setSessions(prev => prev.filter(s => s.id !== sessionId));
                    if (currentSessionId === sessionId) {
                        const remaining = sessions.filter(s => s.id !== sessionId);
                        if (remaining.length > 0) {
                            setCurrentSessionId(remaining[0].id);
                        } else {
                            handleNewChat();
                        }
                    }
                } catch (error) {
                    console.error("Failed to delete session", error);
                }
            }
        });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden font-sans relative">


            {/* Modal Overlay */}
            {modal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-6 transform animate-scale-in">
                        <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto text-red-600 dark:text-red-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                        </div>

                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{modal.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{modal.message}</p>
                            {modal.subMessage && <p className="text-gray-400 dark:text-gray-500 text-xs font-medium italic">{modal.subMessage}</p>}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setModal(null)}
                                className="flex-1 px-4 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={modal.onConfirm}
                                className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30 transition-all active:scale-95 text-sm"
                            >
                                {modal.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)} />
            )}
            <aside className={`flex flex-col w-72 bg-white dark:bg-gray-800 border-r dark:border-gray-700 fixed md:relative z-30 h-full transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:hidden'} md:translate-x-0 md:w-72`}>
                <div className="p-4 border-b dark:border-gray-700 space-y-4 bg-gray-50 dark:bg-gray-800">
                    <div className="flex justify-between items-center">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors text-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                            </svg>
                            Back to Dashboard
                        </button>
                        <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Chat Sessions</span>
                </div>

                <div className="p-4">
                    <Button.Root onClick={handleNewChat} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl shadow-sm transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        New Chat
                    </Button.Root>
                </div>
                <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 scrollbar-thin">
                    <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Recent Chats</p>
                    {sessions.map(session => (
                        <div key={session.id} className={`group flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${currentSessionId === session.id ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                            {editingSessionId === session.id ? (
                                <input autoFocus className="flex-1 bg-white dark:bg-gray-800 border-none outline-none ring-1 ring-blue-500 rounded px-1 text-sm py-1" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onBlur={() => handleRename(session.id)} onKeyDown={(e) => { if (e.key === 'Enter') handleRename(session.id); if (e.key === 'Escape') setEditingSessionId(null); }} />
                            ) : (
                                <>
                                    <button onClick={() => setCurrentSessionId(session.id)} className="flex-1 text-left py-1.5 truncate text-sm font-medium">
                                        {session.title || "New Chat"}
                                    </button>
                                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => { e.stopPropagation(); setEditingSessionId(session.id); setEditTitle(session.title || "New Chat"); }} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-500 dark:text-gray-400" title="Rename">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                                            </svg>
                                        </button>
                                        <button onClick={(e) => handleDelete(e, session.id)} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                            </svg>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </aside>

            <main className="flex-1 flex flex-col h-full relative w-full">
                <header className="h-14 min-h-[56px] bg-white dark:bg-gray-900 border-b dark:border-gray-800 flex items-center justify-between px-4 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <button className="md:hidden text-gray-600 dark:text-gray-300" onClick={() => setIsSidebarOpen(true)}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm">AI</div>
                            <h1 className="text-sm md:text-base font-semibold text-gray-800 dark:text-white">AI Counselor</h1>
                        </div>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
                    {messages.map((msg, index) => (
                        <ChatBubble key={index} message={msg.message} sender={msg.sender} suggestedActions={msg.suggested_actions} onActionClick={handleSend} />
                    ))}
                    {loading && (
                        <div className="flex items-start animate-pulse">
                            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-none p-3 shadow-sm flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-4 bg-white dark:bg-gray-900 border-t dark:border-gray-800">
                    <div className="max-w-4xl mx-auto flex gap-2 items-end">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask me anything..."
                            className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none max-h-32 min-h-[48px] scrollbar-hide border-0 text-sm"
                            rows={1}
                        />
                        <button onClick={() => handleSend()} disabled={loading || !input.trim()} className={`p-3 rounded-full bg-blue-600 text-white transition-all shadow-md ${(!input.trim() || loading) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 hover:scale-105 active:scale-95'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AICounselor;

// Add styles locally
const styles = `
@keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
}
@keyframes scale-in {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
}
.animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
.animate-scale-in { animation: scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
`;

if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}
