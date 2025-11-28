import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm GLAMFLOW AI. I help beauty professionals automate content and manage their business. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Predefined responses for now (will connect to Gemini later)
  const getBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();

    const responses = {
      greeting: {
        keywords: ['hello', 'hi', 'hey', 'greetings'],
        response: "Hey there! 👋 Welcome to GLAMFLOW AI. I can help you with content creation, client management, and business automation. What would you like to know?",
      },
      content: {
        keywords: ['content', 'create', 'post', 'video', 'instagram', 'tiktok', 'social'],
        response: "I can help you generate social media content! 📱 Tell me:\n• What type of content? (reels, posts, stories)\n• Your beauty niche? (makeup, skincare, nails, etc.)\n• Target audience?\n\nI'll create it for you in minutes!",
      },
      pricing: {
        keywords: ['price', 'cost', 'subscription', 'plan', 'premium', 'free'],
        response: "GLAMFLOW AI offers:\n💰 FREE TIER: Basic chatbot + 5 posts/month\n✨ PRO: $29/mo - Unlimited content + Manager Bot\n🔥 ENTERPRISE: Custom pricing - Full automation\n\nInterested in upgrading?",
      },
      features: {
        keywords: ['features', 'what can you do', 'capabilities', 'manager bot'],
        response: "GLAMFLOW AI includes:\n✅ AI Content Generation (Gemini-powered)\n✅ Community Chat & Network\n✅ Manager Bot (handles your whole shift)\n✅ Analytics Dashboard\n✅ Client Management\n✅ Automated Scheduling\n\nWhich would you like to learn more about?",
      },
      help: {
        keywords: ['help', 'support', 'how', 'guide', 'tutorial'],
        response: "I'm here to help! 🤝 You can:\n• Ask about features\n• Get content ideas\n• Discuss pricing\n• Schedule a demo\n• Report issues\n\nWhat do you need?",
      },
    };

    for (const [key, data] of Object.entries(responses)) {
      if (data.keywords.some(keyword => message.includes(keyword))) {
        return data.response;
      }
    }

    return "That's interesting! For more specific help, could you tell me more? Are you interested in content creation, client management, or learning about GLAMFLOW AI's features?";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate bot response delay
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: getBotResponse(input),
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
    }, 800);
  };

  return (
    <>
      {/* Chatbot Button */}
      <div className="chatbot-button" onClick={() => setIsOpen(!isOpen)}>
        <span className="chat-icon">💬</span>
      </div>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <div className="header-content">
              <h3>GLAMFLOW AI</h3>
              <p>Beauty Professional Assistant</p>
            </div>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              ✕
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.sender}`}>
                <div className="message-bubble">
                  <p>{msg.text}</p>
                  <span className="timestamp">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message bot">
                <div className="message-bubble">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="chatbot-input"
            />
            <button type="submit" disabled={isLoading || !input.trim()} className="send-btn">
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;
