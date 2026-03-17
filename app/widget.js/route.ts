// app/widget.js/route.ts

export async function GET() {
  const widgetScript = `
(function() {
  // Prevent loading twice
  if (window.__embedai_loaded) return;
  window.__embedai_loaded = true;

  // Get bot ID from script tag
  var scripts = document.querySelectorAll('script[data-bot-id]');
  var currentScript = scripts[scripts.length - 1];
  var botId = currentScript ? currentScript.getAttribute('data-bot-id') : null;

  if (!botId) {
    console.error('EmbedAI: data-bot-id attribute is required');
    return;
  }

  // Base URL of EmbedAI platform
  var BASE_URL = '${process.env.NEXT_PUBLIC_APP_URL}';

  // ============================================
  // STYLES
  // ============================================
  var style = document.createElement('style');
  style.textContent = \`
    #embedai-container * {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      margin: 0;
      padding: 0;
    }

    #embedai-bubble {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 24px rgba(0,0,0,0.18);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    #embedai-bubble:hover {
      transform: scale(1.08);
      box-shadow: 0 8px 32px rgba(0,0,0,0.22);
    }

    #embedai-bubble svg {
      width: 26px;
      height: 26px;
      fill: white;
    }

    #embedai-window {
      position: fixed;
      bottom: 92px;
      right: 24px;
      width: 370px;
      height: 520px;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 8px 48px rgba(0,0,0,0.18);
      z-index: 999998;
      display: none;
      flex-direction: column;
      background: #fff;
      border: 1px solid #e5e7eb;
      transition: opacity 0.2s, transform 0.2s;
      opacity: 0;
      transform: translateY(16px) scale(0.97);
    }

    #embedai-window.open {
      display: flex;
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    #embedai-header {
      padding: 14px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }

    #embedai-header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    #embedai-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: rgba(255,255,255,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    #embedai-avatar svg {
      width: 18px;
      height: 18px;
      fill: white;
    }

    #embedai-bot-name {
      color: white;
      font-weight: 700;
      font-size: 15px;
    }

    #embedai-bot-status {
      color: rgba(255,255,255,0.75);
      font-size: 11px;
      margin-top: 1px;
    }

    #embedai-close {
      background: none;
      border: none;
      cursor: pointer;
      color: rgba(255,255,255,0.8);
      display: flex;
      align-items: center;
      padding: 4px;
      border-radius: 50%;
      transition: background 0.15s;
    }

    #embedai-close:hover {
      background: rgba(255,255,255,0.15);
      color: white;
    }

    #embedai-close svg {
      width: 18px;
      height: 18px;
      fill: currentColor;
    }

    #embedai-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: #f8fafc;
    }

    #embedai-messages::-webkit-scrollbar {
      width: 4px;
    }

    #embedai-messages::-webkit-scrollbar-track {
      background: transparent;
    }

    #embedai-messages::-webkit-scrollbar-thumb {
      background: #e2e8f0;
      border-radius: 4px;
    }

    .embedai-msg {
      display: flex;
      gap: 8px;
      max-width: 100%;
    }

    .embedai-msg.user {
      justify-content: flex-end;
    }

    .embedai-msg.bot {
      justify-content: flex-start;
    }

    .embedai-bubble-msg {
      max-width: 78%;
      padding: 10px 14px;
      border-radius: 18px;
      font-size: 14px;
      line-height: 1.55;
      word-break: break-word;
    }

    .embedai-msg.user .embedai-bubble-msg {
      color: white;
      border-bottom-right-radius: 4px;
    }

    .embedai-msg.bot .embedai-bubble-msg {
      background: white;
      color: #1e293b;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.07);
      border: 1px solid #f1f5f9;
    }

    .embedai-typing {
      display: flex;
      gap: 4px;
      padding: 12px 16px;
      background: white;
      border-radius: 18px;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.07);
      border: 1px solid #f1f5f9;
      width: fit-content;
    }

    .embedai-typing span {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #94a3b8;
      animation: embedai-bounce 1.2s infinite;
    }

    .embedai-typing span:nth-child(2) { animation-delay: 0.2s; }
    .embedai-typing span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes embedai-bounce {
      0%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-6px); }
    }

    #embedai-input-area {
      padding: 12px;
      background: white;
      border-top: 1px solid #f1f5f9;
      display: flex;
      gap: 8px;
      align-items: center;
      flex-shrink: 0;
    }

    #embedai-input {
      flex: 1;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 10px 14px;
      font-size: 14px;
      outline: none;
      color: #1e293b;
      background: #f8fafc;
      transition: border 0.15s;
    }

    #embedai-input:focus {
      border-color: var(--embedai-color, #0ea5e9);
      background: white;
    }

    #embedai-input::placeholder {
      color: #94a3b8;
    }

    #embedai-send {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: opacity 0.15s, transform 0.15s;
    }

    #embedai-send:hover {
      opacity: 0.88;
      transform: scale(1.05);
    }

    #embedai-send:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    #embedai-send svg {
      width: 17px;
      height: 17px;
      fill: white;
    }

    #embedai-footer {
      text-align: center;
      padding: 6px;
      font-size: 10px;
      color: #cbd5e1;
      background: white;
      flex-shrink: 0;
    }

    #embedai-footer a {
      color: #94a3b8;
      text-decoration: none;
    }

    #embedai-footer a:hover {
      text-decoration: underline;
    }

    @media (max-width: 480px) {
      #embedai-window {
        width: 100vw;
        height: 100vh;
        bottom: 0;
        right: 0;
        border-radius: 0;
      }

      #embedai-bubble {
        bottom: 16px;
        right: 16px;
      }
    }
  \`;
  document.head.appendChild(style);

  // ============================================
  // HTML STRUCTURE
  // ============================================
  var container = document.createElement('div');
  container.id = 'embedai-container';

  container.innerHTML = \`
    <button id="embedai-bubble">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
      </svg>
    </button>

    <div id="embedai-window">
      <div id="embedai-header">
        <div id="embedai-header-left">
          <div id="embedai-avatar">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
          </div>
          <div>
            <div id="embedai-bot-name">AI Assistant</div>
            <div id="embedai-bot-status">● Online</div>
          </div>
        </div>
        <button id="embedai-close">
          <svg viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      <div id="embedai-messages"></div>

      <div id="embedai-input-area">
        <input
          id="embedai-input"
          type="text"
          placeholder="Ask a question..."
          autocomplete="off"
        />
        <button id="embedai-send" disabled>
          <svg viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>

      <div id="embedai-footer">
        Powered by <a href="${process.env.NEXT_PUBLIC_APP_URL}" target="_blank">EmbedAI</a>
      </div>
    </div>
  \`;

  document.body.appendChild(container);

  // ============================================
  // ELEMENTS
  // ============================================
  var bubble    = document.getElementById('embedai-bubble');
  var window_   = document.getElementById('embedai-window');
  var closeBtn  = document.getElementById('embedai-close');
  var messages  = document.getElementById('embedai-messages');
  var input     = document.getElementById('embedai-input');
  var sendBtn   = document.getElementById('embedai-send');
  var botName   = document.getElementById('embedai-bot-name');

  // ============================================
  // STATE
  // ============================================
  var isOpen      = false;
  var isLoading   = false;
  var sessionId   = null;
  var primaryColor = '#0ea5e9';
  var welcomeMsg  = 'Hi! How can I help you today?';
  var initialized = false;

  // ============================================
  // FETCH BOT CONFIG
  // ============================================
  fetch(BASE_URL + '/api/bots/public?botId=' + botId)
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.bot) {
        primaryColor = data.bot.primary_color || '#0ea5e9';
        welcomeMsg   = data.bot.welcome_message || 'Hi! How can I help you today?';

        // Apply brand color
        bubble.style.backgroundColor    = primaryColor;
        sendBtn.style.backgroundColor   = primaryColor;
        document.getElementById('embedai-header').style.backgroundColor = primaryColor;
        document.documentElement.style.setProperty('--embedai-color', primaryColor);

        // Set bot name
        botName.textContent = data.bot.name || 'AI Assistant';
      }
      initialized = true;
      sendBtn.disabled = false;
    })
    .catch(function() {
      // Use defaults if fetch fails
      bubble.style.backgroundColor  = primaryColor;
      sendBtn.style.backgroundColor = primaryColor;
      document.getElementById('embedai-header').style.backgroundColor = primaryColor;
      initialized = true;
      sendBtn.disabled = false;
    });

  // ============================================
  // OPEN / CLOSE
  // ============================================
  function openChat() {
    isOpen = true;
    window_.style.display = 'flex';
    setTimeout(function() { window_.classList.add('open'); }, 10);
    bubble.innerHTML = \`
      <svg viewBox="0 0 24 24" fill="white">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>
    \`;

    // Show welcome message on first open
    if (messages.children.length === 0) {
      addMessage('bot', welcomeMsg);
    }

    setTimeout(function() { input.focus(); }, 300);
  }

  function closeChat() {
    isOpen = false;
    window_.classList.remove('open');
    setTimeout(function() { window_.style.display = 'none'; }, 200);
    bubble.innerHTML = \`
      <svg viewBox="0 0 24 24" fill="white">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
      </svg>
    \`;
  }

  bubble.addEventListener('click', function() {
    if (isOpen) closeChat(); else openChat();
  });

  closeBtn.addEventListener('click', closeChat);

  // ============================================
  // ADD MESSAGE TO UI
  // ============================================
  function addMessage(role, text) {
    var msgDiv = document.createElement('div');
    msgDiv.className = 'embedai-msg ' + role;

    var bubble_ = document.createElement('div');
    bubble_.className = 'embedai-bubble-msg';
    bubble_.textContent = text;

    if (role === 'user') {
      bubble_.style.backgroundColor = primaryColor;
    }

    msgDiv.appendChild(bubble_);
    messages.appendChild(msgDiv);
    messages.scrollTop = messages.scrollHeight;
    return bubble_;
  }

  // ============================================
  // TYPING INDICATOR
  // ============================================
  function showTyping() {
    var typingDiv = document.createElement('div');
    typingDiv.className = 'embedai-msg bot';
    typingDiv.id = 'embedai-typing';
    typingDiv.innerHTML = \`
      <div class="embedai-typing">
        <span></span><span></span><span></span>
      </div>
    \`;
    messages.appendChild(typingDiv);
    messages.scrollTop = messages.scrollHeight;
  }

  function hideTyping() {
    var typing = document.getElementById('embedai-typing');
    if (typing) typing.remove();
  }

  // ============================================
  // SEND MESSAGE
  // ============================================
  function sendMessage() {
    var text = input.value.trim();
    if (!text || isLoading) return;

    input.value = '';
    isLoading = true;
    sendBtn.disabled = true;

    addMessage('user', text);
    showTyping();

    fetch(BASE_URL + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: text,
        botId: botId,
        sessionId: sessionId,
      }),
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      hideTyping();

      if (data.sessionId) sessionId = data.sessionId;

      if (data.error) {
        addMessage('bot', 'Sorry, something went wrong. Please try again.');
        return;
      }

      // Simulate word by word typing
      var words     = (data.text || '').split(' ');
      var msgBubble = addMessage('bot', '');
      var displayed = '';
      var i         = 0;

      function typeNextWord() {
        if (i >= words.length) {
          isLoading = false;
          sendBtn.disabled = false;
          input.focus();
          return;
        }
        displayed += (i === 0 ? '' : ' ') + words[i];
        msgBubble.textContent = displayed;
        messages.scrollTop = messages.scrollHeight;
        i++;
        setTimeout(typeNextWord, 30);
      }

      typeNextWord();
    })
    .catch(function() {
      hideTyping();
      addMessage('bot', 'Connection error. Please try again.');
      isLoading = false;
      sendBtn.disabled = false;
    });
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================
  sendBtn.addEventListener('click', sendMessage);

  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  input.addEventListener('input', function() {
    sendBtn.disabled = !input.value.trim() || isLoading;
  });

})();
  `;

  return new Response(widgetScript, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=3600",
      // Allow any website to load this script
      "Access-Control-Allow-Origin": "*",
    },
  });
}