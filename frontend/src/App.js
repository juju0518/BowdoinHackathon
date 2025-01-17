import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, LogOut, Plus, Send, Trash2 } from 'lucide-react';

const CoverLetterWriter = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const colors = {
    primary: '#7C3AED',
    secondary: '#A78BFA',
    background: '#F3F4F6',
    white: '#FFFFFF',
    gray: '#6B7280',
    lightGray: '#E5E7EB',
    success: '#10B981',
    danger: '#EF4444',
    text: '#1F2937',
    lightText: '#4B5563'
  };

  const styles = {
    mainContainer: {
      minHeight: '100vh',
      backgroundColor: colors.background,
      fontFamily: "'Inter', sans-serif",
    },

    loginPage: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      backgroundColor: colors.background,
    },

    loginCard: {
      width: '100%',
      maxWidth: '400px',
      backgroundColor: colors.white,
      borderRadius: '16px',
      padding: '2rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },

    appContainer: {
      display: 'grid',
      gridTemplateRows: 'auto 1fr',
      height: '100vh',
    },

    header: {
      backgroundColor: colors.white,
      padding: '1rem 1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: `1px solid ${colors.lightGray}`,
    },

    mainContent: {
      display: 'grid',
      gridTemplateColumns: '300px 1fr',
      overflow: 'hidden',
    },

    sidebar: {
      backgroundColor: colors.white,
      borderRight: `1px solid ${colors.lightGray}`,
      display: 'flex',
      flexDirection: 'column',
    },

    sidebarHeader: {
      padding: '1rem',
      borderBottom: `1px solid ${colors.lightGray}`,
    },

    chatsList: {
      flex: 1,
      overflowY: 'auto',
      padding: '1rem',
    },

    chatItem: {
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      marginBottom: '0.5rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },

    chatArea: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    },

    messagesContainer: {
      flex: 1,
      overflowY: 'auto',
      padding: '1.5rem',
      backgroundColor: colors.background,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    },

    inputArea: {
      padding: '1rem 1.5rem',
      backgroundColor: colors.white,
      borderTop: `1px solid ${colors.lightGray}`,
    },

    button: {
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },

    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      border: `1px solid ${colors.lightGray}`,
      marginBottom: '1rem',
      fontSize: '1rem',
      outline: 'none',
      transition: 'border-color 0.2s',
    }
  };

  const deleteButton = {
    ...styles.button,
    padding: '0.5rem',
    backgroundColor: 'transparent',
    color: colors.danger,
    opacity: 0.7,
    ':hover': {
      opacity: 1,
    }
  };

  const chatItem = {
    ...styles.chatItem,
    justifyContent: 'space-between',
  };

  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation();
    try {
      const response = await fetch(`http://localhost:3001/api/chat/${chatId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        if (currentChatId === chatId) {
          setCurrentChatId(null);
          setMessages([]);
        }
        fetchChats();
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const messageBubble = (isAi) => ({
    maxWidth: '70%',
    padding: '1rem',
    borderRadius: '16px',
    backgroundColor: isAi ? colors.white : colors.primary,
    color: isAi ? colors.text : colors.white,
    marginBottom: '1rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    alignSelf: isAi ? 'flex-start' : 'flex-end',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      fetchChats();
    }
  }, []);

  const fetchChats = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/chats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setChats(data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const handleLogout = async (e) => {
    try {
      e.preventDefault();
      localStorage.removeItem('token');
      setMessages([]);
      setCurrentChatId(null);
      setChats([]);
      setIsLoggedIn(false);
    }
    catch (error) {
      console.error('Error logging out:', error);
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        setIsLoggedIn(true);
        fetchChats();
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      handleLogin(e);
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: inputText,
          chatId: currentChatId
        })
      });

      const data = await response.json();
      if (data.chatId && !currentChatId) {
        setCurrentChatId(data.chatId);
      }

      setMessages(prev => [
        ...prev,
        { text: inputText, isAi: false },
        { text: data.response, isAi: true }
      ]);
      setInputText('');
      fetchChats();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={styles.loginPage}>
        <div style={styles.loginCard}>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: '700',
            color: colors.text,
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            Welcome!
          </h1>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              style={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                style={{
                  ...styles.button,
                  backgroundColor: colors.primary,
                  color: colors.white,
                  flex: 1,
                }}
              >
                Login
              </button>
              <button
                onClick={handleRegister}
                style={{
                  ...styles.button,
                  backgroundColor: colors.success,
                  color: colors.white,
                  flex: 1,
                }}
              >
                Register
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.appContainer}>
      <header style={styles.header}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '600', color: colors.text }}>
          Cover Letter Generator
        </h1>
        <button
          onClick={handleLogout}
          style={{
            ...styles.button,
            backgroundColor: colors.danger,
            color: colors.white,
          }}
        >
          <LogOut size={18} />
          Logout
        </button>
      </header>

      <div style={styles.mainContent}>
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <button
              onClick={() => {
                setCurrentChatId(null);
                setMessages([]);
              }}
              style={{
                ...styles.button,
                backgroundColor: colors.primary,
                color: colors.white,
                width: '100%',
              }}
            >
              <Plus size={18} />
              New Chat
            </button>
          </div>
          <div style={styles.chatsList}>
            {chats.map(chat => (
              <div
                key={chat._id}
                onClick={() => {
                  setCurrentChatId(chat._id);
                  setMessages(chat.messages);
                }}
                style={{
                  ...chatItem,
                  backgroundColor: currentChatId === chat._id ? colors.primary + '15' : 'transparent',
                  color: currentChatId === chat._id ? colors.primary : colors.text,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <MessageCircle size={18} />
                  <span>Chat {new Date(chat.createdAt).toLocaleDateString()}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteChat(chat._id, e)}
                  style={deleteButton}
                  title="Delete chat"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.chatArea}>
          <div style={styles.messagesContainer}>
            {messages.map((message, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={messageBubble(message.isAi)}>
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div style={styles.inputArea}>
            <form
              onSubmit={handleSubmit}
              style={{
                display: 'flex',
                gap: '1rem',
              }}
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                style={{
                  ...styles.input,
                  marginBottom: 0,
                  flex: 1,
                }}
                placeholder="Write your message here..."
                disabled={isLoading}
              />
              <button
                type="submit"
                style={{
                  ...styles.button,
                  backgroundColor: colors.primary,
                  color: colors.white,
                  opacity: isLoading ? 0.7 : 1,
                }}
                disabled={isLoading}
              >
                <Send size={18} />
                {isLoading ? 'sending...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverLetterWriter;