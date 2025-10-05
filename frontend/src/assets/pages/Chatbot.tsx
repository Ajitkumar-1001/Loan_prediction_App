import React, { useRef, useState, useEffect } from 'react';
import { FaChevronCircleRight, FaRobot, FaUser, FaUpload, FaFile, FaTrash, FaCog } from 'react-icons/fa';
import { useRole } from '../../../context/RoleContext';

interface ChatMsg {
    sender: 'user' | 'bot';
    msg: string;
    timestamp: Date;
}

interface Document {
    id: string;
    filename: string;
    uploaded_at: string;
    size: number;
    type: string;
}

const Chatbot: React.FC = () => {
    const { role } = useRole();
    const [input, setInput] = useState<string>("");
    const [msgStack, setMsgStack] = useState<ChatMsg[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showAdminPanel, setShowAdminPanel] = useState<boolean>(false);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [uploadingFile, setUploadingFile] = useState<boolean>(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isAdmin = role === 'admin';

    const getApiUrl = (endpoint: string) => {
        return window.location.hostname === 'localhost'
            ? `http://localhost:8000${endpoint}`
            : endpoint;
    };

    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
          textarea.rows = 1;
          const lineHeight = 24;
          const lines = Math.floor(textarea.scrollHeight / lineHeight);
          textarea.rows = Math.min(lines, 5);
        }
    }, [input]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [msgStack]);

    // Fetch documents when admin panel is opened
    useEffect(() => {
        if (isAdmin && showAdminPanel) {
            fetchDocuments();
        }
    }, [isAdmin, showAdminPanel]);

    const handleSendMessage = async () => {
        if (!input.trim()) return;

        const userMessage: ChatMsg = {
            sender: 'user',
            msg: input.trim(),
            timestamp: new Date()
        };

        setMsgStack(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch(getApiUrl('/api/chatbot/chat'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage.msg,
                    session_id: 'default'
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();

            const botMessage: ChatMsg = {
                sender: 'bot',
                msg: data.response,
                timestamp: new Date(data.timestamp)
            };

            setMsgStack(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error calling chatbot API:', error);
            const errorMessage: ChatMsg = {
                sender: 'bot',
                msg: "I'm sorry, I'm having trouble connecting to the server. Please make sure the backend is running and try again.",
                timestamp: new Date()
            };
            setMsgStack(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleSampleQuery = (query: string) => {
        setInput(query);
    };

    const fetchDocuments = async () => {
        try {
            const response = await fetch(getApiUrl('/api/chatbot/documents'), {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setDocuments(data.documents || []);
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleFileUpload = async () => {
        if (!selectedFile) return;

        setUploadingFile(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch(getApiUrl('/api/chatbot/upload-document'), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                alert(data.message || 'Document uploaded successfully!');
                setSelectedFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                fetchDocuments();
            } else {
                const error = await response.json();
                alert(error.detail || 'Failed to upload document');
            }
        } catch (error) {
            console.error('Error uploading document:', error);
            alert('Error uploading document');
        } finally {
            setUploadingFile(false);
        }
    };

    const handleDeleteDocument = async (docId: string) => {
        if (!confirm('Are you sure you want to delete this document?')) return;

        try {
            const response = await fetch(getApiUrl(`/api/chatbot/documents/${docId}`), {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });

            if (response.ok) {
                alert('Document deleted successfully');
                fetchDocuments();
            } else {
                alert('Failed to delete document');
            }
        } catch (error) {
            console.error('Error deleting document:', error);
            alert('Error deleting document');
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-950 to-sky-900 flex flex-col p-4 py-35">
            {/* Header */}
          
                <div className='max-w-6xl w-full flex flex-row items-center justify-center gap-25 mx-auto'>
                    <h2 className='text-4xl font-sans font-bold bg-gradient-to-br from-blue-900 to-sky-800 bg-clip-text text-transparent brightness-200 hover:scale-105 transition-transform duration-300'>
                        Hey there! I am Your Banking Assistant!
                    </h2>
                    {isAdmin && (
                        <button
                            onClick={() => setShowAdminPanel(!showAdminPanel)}
                            className='p-3 flex justify-end rounded-full bg-gradient-to-br from-blue-950 to-sky-600 hover:from-sky-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl'
                            title='Admin Panel'
                        >
                            <FaCog className='w-6 h-6 text-white' />
                        </button>
                    )}
                </div>
        

            {/* Admin Panel */}
            {isAdmin && showAdminPanel && (
                <div className='max-w-6xl w-full mx-auto mb-6 mt-15'>
                    <div className='bg-transparent backdrop-blur-xl rounded-2xl border border-blue-500/50 p-6 shadow-2xl'>
                        <h3 className='text-2xl font-bold text-white mb-4 flex items-center gap-2'>
                            <FaUpload className='w-6 h-6' />
                            Admin Panel - Knowledge Base Management
                        </h3>

                        {/* Upload Section */}
                        <div className='bg-transparent rounded-xl p-4 mb-6'>
                            <h4 className='text-lg font-semibold text-white mb-3'>Upload New Document</h4>
                            <div className='flex gap-3 items-end'>
                                <div className='flex-1'>
                                    <input
                                        ref={fileInputRef}
                                        type='file'
                                        onChange={handleFileSelect}
                                        accept='.pdf,.txt,.doc,.docx'
                                        className='w-full px-4 py-2 rounded-lg bg-white/95 text-gray-800 font-medium focus:ring-2 focus:ring-orange-400 focus:outline-none'
                                    />
                                    <p className='text-xs text-gray-300 mt-1'>Accepted formats: PDF, TXT, DOC, DOCX</p>
                                </div>
                                <button
                                    onClick={handleFileUpload}
                                    disabled={!selectedFile || uploadingFile}
                                    className='px-6 py-2 rounded-lg bg-gradient-to-br from-blue-900 to-cyan-900 hover:from-cyan-900 hover:to-blue-900 text-white border-2 border-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl'
                                >
                                    {uploadingFile ? 'Uploading...' : 'Upload'}
                                </button>
                            </div>
                            {selectedFile && (
                                <p className='text-sm text-white mt-2'>
                                    Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                                </p>
                            )}
                        </div>

                        {/* Documents List */}
                        <div className='bg-transparent rounded-xl p-4 py-15 mt-10'>
                            <h4 className='text-lg font-semibold text-white mb-3'>Uploaded Documents ({documents.length})</h4>
                            {documents.length === 0 ? (
                                <p className='text-gray-400 text-center py-8'>No documents uploaded yet</p>
                            ) : (
                                <div className='space-y-2 max-h-64 overflow-y-auto'>
                                    {documents.map((doc) => (
                                        <div
                                            key={doc.id}
                                            className='flex items-center justify-between bg-white/10 rounded-lg p-3 hover:bg-white/20 transition-colors'
                                        >
                                            <div className='flex items-center gap-3 flex-1'>
                                                <FaFile className='w-5 h-5 text-blue-400' />
                                                <div className='flex-1'>
                                                    <p className='text-white font-medium'>{doc.filename}</p>
                                                    <p className='text-xs text-gray-400'>
                                                        {formatFileSize(doc.size)} • Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteDocument(doc.id)}
                                                className='p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 transition-colors'
                                                title='Delete document'
                                            >
                                                <FaTrash className='w-4 h-4 text-red-400' />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isAdmin && !showAdminPanel && (

            <div className={`flex-1 max-w-6xl w-full mx-auto flex flex-col gap-5 space-y-3 mt-15 ${msgStack.length === 0 ? 'justify-center' : ''}`}>
                {/* Messages Area - Only show when there are messages */}
                {msgStack.length > 0 && (
                    <div
                        ref={chatContainerRef}
                        className='flex-1 bg-transparent backdrop-blur-xl rounded-2xl p-6 overflow-y-auto max-h-[500px] min-h-[400px] shadow-2xl'
                    >
                        <div className='space-y-4'>
                            {msgStack.map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    {/* Avatar */}
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                        message.sender === 'user'
                                            ? 'bg-gradient-to-br from-sky-500 to-blue-600'
                                            : 'bg-gradient-to-br from-purple-500 to-pink-600'
                                    }`}>
                                        {message.sender === 'user' ? <FaUser className='w-5 h-5 text-white' /> : <FaRobot className='w-5 h-5 text-white' />}
                                    </div>

                                    {/* Message Bubble */}
                                    <div className={`max-w-[70%] rounded-2xl p-4 ${
                                        message.sender === 'user'
                                            ? 'bg-gradient-to-br from-sky-600 to-blue-700 text-white'
                                            : 'bg-white/95 text-gray-800'
                                    }`}>
                                        <p className='text-base leading-relaxed whitespace-pre-wrap break-words'>{message.msg}</p>
                                        <span className={`text-xs mt-2 block ${
                                            message.sender === 'user' ? 'text-sky-200' : 'text-gray-500'
                                        }`}>
                                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {/* Loading Indicator */}
                            {isLoading && (
                                <div className='flex gap-3'>
                                    <div className='flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600'>
                                        <FaRobot className='w-5 h-5 text-white' />
                                    </div>
                                    <div className='bg-white/95 rounded-2xl p-4'>
                                        <div className='flex gap-2'>
                                            <div className='w-2 h-2 bg-gray-500 rounded-full animate-bounce' style={{ animationDelay: '0ms' }}></div>
                                            <div className='w-2 h-2 bg-gray-500 rounded-full animate-bounce' style={{ animationDelay: '150ms' }}></div>
                                            <div className='w-2 h-2 bg-gray-500 rounded-full animate-bounce' style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div className='bg-black/40 backdrop-blur-xl rounded-2xl border border-sky-700/50 p-4 shadow-2xl'>
                    <div className='flex gap-3 items-end'>
                        <textarea
                            ref={textareaRef}
                            value={input}
                            placeholder='Ask me your banking queries...'
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            disabled={isLoading}
                            className='resize-none flex-1 p-3 max-h-32 rounded-xl bg-white/95 text-black text-base font-medium focus:ring-2 focus:ring-sky-400 focus:outline-none overflow-y-auto disabled:opacity-50 disabled:cursor-not-allowed'
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={isLoading || !input.trim()}
                            className='flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105'
                        >
                            <FaChevronCircleRight className='w-6 h-6 text-white' />
                        </button>
                    </div>
                </div>

                {/* Sample Queries */}
                {msgStack.length === 0 && (
                    <div className='bg-transparent backdrop-blur rounded-2xl border border-blue-300 p-6 shadow-2xl'>
                        <h3 className='text-2xl font-bold text-center mb-4 text-white'>
                            Sample Queries
                        </h3>
                        <div className='space-y-3'>
                            {[
                                "My loan has been rejected even though my income is more than that of the loan amount! Why?",
                                "Based on my annual income how much loan can I apply and which bank has best interest rates?",
                                "How can I improve my financial status by a prominent savings plan?"
                            ].map((query, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSampleQuery(query)}
                                    className='w-full text-left px-4 py-3 rounded-lg bg-gradient-to-r from-sky-50 to-blue-50 hover:from-sky-100 hover:to-blue-100 border border-sky-200 text-gray-800 font-medium text-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02]'
                                >
                                    {query}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>)}
        </div>
    );
};

export default Chatbot;
