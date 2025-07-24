import React from 'react';
import './MessageList.css';

const MessageList = ({ messages }) => {
  return (
    <div className="message-list">
      {messages.length === 0 ? (
        <div className="no-messages">No messages yet. Start a conversation!</div>
      ) : (
        messages.map((message) => (
          <div
            key={message._id}
            className={`message ${message.messageType === 'bot' ? 'bot-message' : 'user-message'}`}
          >
            <div className="message-header">
              <span className="message-sender">{message.sender}</span>
              <span className="message-timestamp">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="message-content">{message.content}</div>
          </div>
        ))
      )}
    </div>
  );
};

export default MessageList;