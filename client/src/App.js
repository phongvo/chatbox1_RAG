import React, { useState, useEffect } from 'react';
import './App.css';
import ChatBox from './components/ChatBox';
import MessageList from './components/MessageList';
import UserList from './components/UserList';
import { getMessages, sendMessage, getUsers } from './services/api';

function App() {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState('User');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
    fetchUsers();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await getMessages();
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSendMessage = async (content) => {
    try {
      const messageData = {
        content,
        sender: currentUser,
        messageType: 'user'
      };
      
      const response = await sendMessage(messageData);
      setMessages(prev => [response.data, ...prev]);
      
      // Simulate bot response
      setTimeout(async () => {
        const botResponse = {
          content: `Bot response to: ${content}`,
          sender: 'Bot',
          messageType: 'bot'
        };
        
        const botMessage = await sendMessage(botResponse);
        setMessages(prev => [botMessage.data, ...prev]);
      }, 1000);
      
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Chatbox RAG</h1>
      </header>
      
      <div className="app-container">
        <div className="sidebar">
          <UserList users={users} currentUser={currentUser} setCurrentUser={setCurrentUser} />
        </div>
        
        <div className="main-content">
          <MessageList messages={messages} />
          <ChatBox onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  );
}

export default App;