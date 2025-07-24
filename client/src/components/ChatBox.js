import React, { useState } from 'react';
import './ChatBox.css';

const ChatBox = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="chatbox">
      <form onSubmit={handleSubmit} className="chatbox-form">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="chatbox-input"
        />
        <button type="submit" className="chatbox-button">
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBox;