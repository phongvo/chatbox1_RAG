import React, { useState } from 'react';

function ChatBox({ onSendMessage }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="p-5 bg-white border-t border-gray-300">
      <form onSubmit={handleSubmit} className="flex gap-2.5">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-3 border border-gray-300 rounded text-base focus:outline-none focus:border-primary"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-primary text-white border-none rounded cursor-pointer text-base hover:bg-blue-600 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatBox;