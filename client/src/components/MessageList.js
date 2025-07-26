import React, { useState, useEffect, useRef } from 'react';

// Typing effect component
function TypingMessage({ message, onComplete }) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const fullText = message.content;

  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + fullText[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 30); // Adjust typing speed here (lower = faster)
      
      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, fullText, onComplete]);

  return (
    <div className="mb-4 p-3 rounded-lg max-w-[70%] bg-gray-200 text-gray-800 mr-auto">
      <div className="flex justify-between mb-1 text-xs opacity-80">
        <span>{message.sender}</span>
        <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
      </div>
      <div className="text-base leading-relaxed">
        {displayedText}
        {currentIndex < fullText.length && (
          <span className="animate-pulse">|</span>
        )}
      </div>
    </div>
  );
}

// Typing indicator component
function TypingIndicator() {
  return (
    <div className="mb-4 p-3 rounded-lg max-w-[70%] bg-gray-200 text-gray-800 mr-auto">
      <div className="flex justify-between mb-1 text-xs opacity-80">
        <span>RAG Bot</span>
        <span>{new Date().toLocaleTimeString()}</span>
      </div>
      <div className="text-base leading-relaxed flex items-center">
        <span>Typing</span>
        <div className="flex ml-2 space-x-1">
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
        </div>
      </div>
    </div>
  );
}

function MessageList({ messages, isTyping, setMessages }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleTypingComplete = (messageId) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, isCurrentlyTyping: false, hasTypingEffect: false }
          : msg
      )
    );
  };

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 p-5 overflow-y-auto bg-gray-50">
        <div className="text-center text-gray-600 italic mt-12">
          No messages yet. Start a conversation!
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-5 overflow-y-auto bg-gray-50">
      {messages.map((message) => {
        // Only show typing effect for NEW LLM responses that have hasTypingEffect = true
        if (message.messageType === 'bot' && message.hasTypingEffect && message.isCurrentlyTyping) {
          return (
            <TypingMessage 
              key={message.id} 
              message={message} 
              onComplete={() => handleTypingComplete(message.id)}
            />
          );
        }
        
        // Regular message display for all other messages
        return (
          <div
            key={message.id || message.timestamp}
            className={`mb-4 p-3 rounded-lg max-w-[70%] ${
              message.messageType === 'user'
                ? 'bg-primary text-white ml-auto text-right'
                : message.messageType === 'error'
                ? 'bg-red-200 text-red-800 mr-auto'
                : 'bg-gray-200 text-gray-800 mr-auto'
            }`}
          >
            <div className="flex justify-between mb-1 text-xs opacity-80">
              <span>{message.sender}</span>
              <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
            </div>
            <div className="text-base leading-relaxed">
              {message.content}
            </div>
          </div>
        );
      })}
      
      {/* Typing indicator */}
      {isTyping && <TypingIndicator />}
      
      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList;