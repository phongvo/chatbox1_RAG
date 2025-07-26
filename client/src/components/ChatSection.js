import React, { useState, useEffect } from 'react';
import ChatBox from './ChatBox';
import MessageList from './MessageList';
import UserList from './UserList';
import { getMessages, sendMessage, getUsers, sendChatMessage } from '../services/api';

function ChatSection({ currentUser }) {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    fetchMessages();
    fetchUsers();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await getMessages();
      // Ensure we always set an array, even if response.data is undefined or not an array
      // Mark existing messages as NOT having typing effect
      const existingMessages = Array.isArray(response.data) ? 
        response.data.map(msg => ({ ...msg, hasTypingEffect: false })) : [];
      setMessages(existingMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Set empty array on error to prevent the map error
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      // Ensure we always set an array for users too
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Set empty array on error
      setUsers([]);
    }
  };

  const handleSendMessage = async (content) => {
    try {
      // Add user message to UI immediately (no typing effect for user messages)
      const userMessage = {
        id: Date.now(),
        content,
        sender: currentUser?.username || currentUser?.email || 'User',
        messageType: 'user',
        timestamp: new Date().toISOString(),
        hasTypingEffect: false
      };
      setMessages(prev => [...(Array.isArray(prev) ? prev : []), userMessage]);
      
      // Show typing indicator
      setIsTyping(true);
      
      // Send to LMStudio chat API
      const chatData = {
        message: content,
        model: 'mistralai/Mistral-7B-Instruct-v0.3-GGUF',
        temperature: 0.7,
        maxTokens: 1500,
        useRAG: true // Enable RAG for better responses
      };
      
      const response = await sendChatMessage(chatData);
      
      // Hide typing indicator
      setIsTyping(false);
      
      // Add bot response with typing effect ONLY for new LLM responses
      const botMessage = {
        id: Date.now() + 1,
        content: response.data.data.response,
        sender: 'RAG Bot',
        messageType: 'bot',
        timestamp: new Date().toISOString(),
        model: response.data.data.model,
        useRAG: response.data.data.useRAG,
        hasTypingEffect: true, // Only new LLM responses get typing effect
        isCurrentlyTyping: true
      };
      setMessages(prev => [...(Array.isArray(prev) ? prev : []), botMessage]);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      
      // Add error message to UI (no typing effect for errors)
      const errorMessage = {
        id: Date.now() + 2,
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'System',
        messageType: 'error',
        timestamp: new Date().toISOString(),
        hasTypingEffect: false
      };
      setMessages(prev => [...(Array.isArray(prev) ? prev : []), errorMessage]);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Chat Messages</h2>
        <div className="flex h-96 border border-gray-200 rounded-lg overflow-hidden">
          {/* User List Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200">
            <UserList 
              users={users} 
              currentUser={currentUser?.username || currentUser?.email || 'User'} 
              setCurrentUser={() => {}} 
            />
          </div>
          
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            <MessageList 
              messages={messages} 
              isTyping={isTyping}
              setMessages={setMessages}
            />
            <ChatBox onSendMessage={handleSendMessage} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatSection;