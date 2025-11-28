// GLAMFLOW AI Chatbot - Vanilla JavaScript Version
(function() {
    const chatbotHTML = `
        <div class="chatbot-button" id="chatbot-toggle">
            <span class="chat-icon">💬</span>
        </div>

        <div class="chatbot-container" id="chatbot-window" style="display: none;">
            <div class="chatbot-header">
                <div class="header-content">
                    <h3>GLAMFLOW AI</h3>
                    <p>Beauty Professional Assistant</p>
                </div>
                <button class="close-btn" id="chatbot-close">✕</button>
            </div>

            <div class="chatbot-messages" id="chatbot-messages">
                <div class="message bot">
                    <div class="message-bubble">
                        <p>Hi! I'm GLAMFLOW AI. I help beauty professionals automate content and manage their business. How can I assist you today?</p>
                        <span class="timestamp">Now</span>
                    </div>
                </div>
            </div>

            <form class="chatbot-input-form" id="chatbot-form">
                <input type="text" id="chatbot-input" placeholder="Ask me anything..." class="chatbot-input" />
                <button type="submit" class="send-btn">➤</button>
            </form>
        </div>
    `;

    const chatbotCSS = `
        .chatbot-button {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            transition: all 0.3s ease;
            z-index: 999;
            border: none;
            font-size: 1.5rem;
        }

        .chatbot-button:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        .chat-icon {
            animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }

        .chatbot-container {
            position: fixed;
            bottom: 100px;
            right: 30px;
            width: 380px;
            max-width: calc(100vw - 20px);
            height: 600px;
            background: #1a1a2e;
            border-radius: 15px;
            display: flex;
            flex-direction: column;
            box-shadow: 0 5px 40px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.3s ease;
            z-index: 1000;
        }

        @keyframes slideUp {
            from {
                transform: translateY(20px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        .chatbot-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 15px 15px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .header-content h3 {
            margin: 0;
            font-size: 1.2rem;
            font-weight: bold;
        }

        .header-content p {
            margin: 5px 0 0 0;
            font-size: 0.85rem;
            opacity: 0.9;
        }

        .close-btn {
            background: transparent;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s ease;
        }

        .close-btn:hover {
            transform: rotate(90deg);
        }

        .chatbot-messages {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            background: #0f0f1e;
        }

        .chatbot-messages::-webkit-scrollbar {
            width: 6px;
        }

        .chatbot-messages::-webkit-scrollbar-track {
            background: #1a1a2e;
        }

        .chatbot-messages::-webkit-scrollbar-thumb {
            background: #667eea;
            border-radius: 3px;
        }

        .message {
            display: flex;
            margin-bottom: 8px;
        }

        .message.user {
            justify-content: flex-end;
        }

        .message.bot {
            justify-content: flex-start;
        }

        .message-bubble {
            max-width: 75%;
            padding: 12px 16px;
            border-radius: 12px;
            word-wrap: break-word;
            animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .message.user .message-bubble {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-bottom-right-radius: 4px;
        }

        .message.bot .message-bubble {
            background: #2a2a4e;
            color: #e0e0e0;
            border-bottom-left-radius: 4px;
        }

        .message-bubble p {
            margin: 0 0 5px 0;
            line-height: 1.4;
            white-space: pre-wrap;
        }

        .timestamp {
            font-size: 0.75rem;
            opacity: 0.7;
            display: block;
            margin-top: 5px;
        }

        .typing-indicator {
            display: flex;
            gap: 4px;
            align-items: center;
            height: 16px;
        }

        .typing-indicator span {
            width: 8px;
            height: 8px;
            background: #667eea;
            border-radius: 50%;
            animation: typing 1.4s infinite;
        }

        .typing-indicator span:nth-child(2) {
            animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
            animation-delay: 0.4s;
        }

        @keyframes typing {
            0%, 60%, 100% {
                transform: translateY(0);
                opacity: 0.5;
            }
            30% {
                transform: translateY(-10px);
                opacity: 1;
            }
        }

        .chatbot-input-form {
            display: flex;
            gap: 10px;
            padding: 15px 20px;
            background: #1a1a2e;
            border-radius: 0 0 15px 15px;
            border-top: 1px solid #2a2a4e;
        }

        .chatbot-input {
            flex: 1;
            background: #2a2a4e;
            border: 1px solid #3a3a5e;
            color: white;
            padding: 10px 12px;
            border-radius: 8px;
            font-size: 0.95rem;
            outline: none;
            transition: all 0.3s ease;
        }

        .chatbot-input:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .chatbot-input::placeholder {
            color: #7a7a9e;
        }

        .send-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1.2rem;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .send-btn:hover:not(:disabled) {
            transform: scale(1.05);
        }

        .send-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        @media (max-width: 768px) {
            .chatbot-container {
                width: calc(100vw - 40px);
                height: 500px;
                bottom: 80px;
                right: 20px;
            }
        }
    `;

    // Bot responses
    const getBotResponse = (message) => {
        const msg = message.toLowerCase();
        
        const responses = {
            greeting: {
                keywords: ['hello', 'hi', 'hey'],
                response: "Hey there! 👋 Welcome to GLAMFLOW AI. I can help you with content creation, client management, and business automation. What would you like to know?"
            },
            content: {
                keywords: ['content', 'create', 'post', 'video'],
                response: "I can help you generate social media content! 📱 Tell me what type (reels, posts, stories) and your beauty niche, and I'll create it for you in minutes!"
            },
            pricing: {
                keywords: ['price', 'cost', 'subscription', 'premium'],
                response: "GLAMFLOW AI offers:\n💰 FREE: 5 posts/month\n✨ PRO: $29/mo - Unlimited content\n🔥 ENTERPRISE: Custom pricing\n\nInterested in upgrading?"
            },
            features: {
                keywords: ['features', 'what can', 'capabilities'],
                response: "✅ AI Content Generation\n✅ Community Chat\n✅ Manager Bot\n✅ Analytics\n✅ Client Management\n\nWhich would you like to learn about?"
            }
        };

        for (const [key, data] of Object.entries(responses)) {
            if (data.keywords.some(keyword => msg.includes(keyword))) {
                return data.response;
            }
        }

        return "That's interesting! Tell me more. Are you interested in content creation, client management, or learning about our features?";
    };

    // Initialize chatbot
    document.addEventListener('DOMContentLoaded', function() {
        // Add CSS
        const styleSheet = document.createElement('style');
        styleSheet.textContent = chatbotCSS;
        document.head.appendChild(styleSheet);

        // Add HTML
        const chatbotRoot = document.getElementById('chatbot-root');
        if (chatbotRoot) {
            chatbotRoot.innerHTML = chatbotHTML;

            const toggleBtn = document.getElementById('chatbot-toggle');
            const closeBtn = document.getElementById('chatbot-close');
            const window_ = document.getElementById('chatbot-window');
            const form = document.getElementById('chatbot-form');
            const input = document.getElementById('chatbot-input');
            const messagesContainer = document.getElementById('chatbot-messages');

            // Toggle chatbot
            toggleBtn.addEventListener('click', () => {
                window_.style.display = window_.style.display === 'none' ? 'flex' : 'none';
                if (window_.style.display === 'flex') {
                    input.focus();
                }
            });

            closeBtn.addEventListener('click', () => {
                window_.style.display = 'none';
            });

            // Send message
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const text = input.value.trim();
                if (!text) return;

                // Add user message
                const userMsg = document.createElement('div');
                userMsg.className = 'message user';
                userMsg.innerHTML = `
                    <div class="message-bubble">
                        <p>${escapeHtml(text)}</p>
                        <span class="timestamp">Now</span>
                    </div>
                `;
                messagesContainer.appendChild(userMsg);
                input.value = '';

                // Add typing indicator
                const typingMsg = document.createElement('div');
                typingMsg.className = 'message bot';
                typingMsg.id = 'typing-indicator';
                typingMsg.innerHTML = `
                    <div class="message-bubble">
                        <div class="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                `;
                messagesContainer.appendChild(typingMsg);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;

                // Get bot response
                setTimeout(() => {
                    typingMsg.remove();
                    const response = getBotResponse(text);
                    const botMsg = document.createElement('div');
                    botMsg.className = 'message bot';
                    botMsg.innerHTML = `
                        <div class="message-bubble">
                            <p>${escapeHtml(response)}</p>
                            <span class="timestamp">Now</span>
                        </div>
                    `;
                    messagesContainer.appendChild(botMsg);
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }, 800);
            });
        }
    });

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
})();
