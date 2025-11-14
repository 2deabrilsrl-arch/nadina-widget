// nadina-widget.js
// Script para cargar el widget de Nadina AI dinámicamente
// Se carga desde GTM sin necesidad de iframe

(function() {
  'use strict';

  // Evitar cargar el widget múltiples veces
  if (window.nadinaWidgetLoaded) return;
  window.nadinaWidgetLoaded = true;

  const CONFIG = {
    API_URL: 'https://nadina-ai-backend-ev8v.vercel.app/api/chat',
    LOG_URL: 'https://nadina-ai-backend-ev8v.vercel.app/api/log',
    STORAGE_KEY: 'nadina_chat_history',
    MAX_HISTORY: 10,
    WHATSAPP_NUMBER: '5493413035268',
    AVATAR_URL: 'https://i.ibb.co/zxzY3JQ/nadina-avatar.jpg'
  };

  // Inyectar CSS
  function injectStyles() {
    const css = `
      /* Reset básico */
      #nadina-widget * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      /* Variables CSS - Diseño Minimal Nadin */
      :root {
        --nadina-primary: #ef88b7;
        --nadina-primary-dark: #d67099;
        --nadina-primary-light: #fce4ec;
        --nadina-white: #ffffff;
        --nadina-gray-50: #fafafa;
        --nadina-gray-100: #f5f5f5;
        --nadina-gray-200: #eeeeee;
        --nadina-gray-300: #e0e0e0;
        --nadina-gray-400: #bdbdbd;
        --nadina-gray-700: #616161;
        --nadina-gray-900: #212121;
        --nadina-shadow-sm: rgba(0, 0, 0, 0.08);
        --nadina-shadow-md: rgba(0, 0, 0, 0.12);
        --nadina-font: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
      }

      #nadina-widget {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 999999;
        font-family: var(--nadina-font);
        font-size: 14px;
        line-height: 1.5;
      }

      #nadina-chat-button {
        width: 64px;
        height: 64px;
        border-radius: 16px;
        background: linear-gradient(135deg, var(--nadina-primary) 0%, var(--nadina-primary-dark) 100%);
        border: none;
        cursor: pointer;
        box-shadow: 0 2px 12px var(--nadina-shadow-md);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
        padding: 0;
      }

      #nadina-chat-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px var(--nadina-shadow-md);
      }

      #nadina-chat-button img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
      }

      #nadina-whatsapp-button {
        position: absolute;
        bottom: 0;
        right: 72px;
        width: 48px;
        height: 48px;
        border-radius: 12px;
        background: #25D366;
        border: none;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(37, 211, 102, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        opacity: 0;
        pointer-events: none;
      }

      #nadina-whatsapp-button.visible {
        opacity: 1;
        pointer-events: auto;
      }

      #nadina-whatsapp-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4);
      }

      #nadina-whatsapp-button svg {
        width: 28px;
        height: 28px;
        fill: white;
      }

      #nadina-chat-window {
        position: fixed;
        bottom: 96px;
        right: 20px;
        width: 360px;
        height: 520px;
        background: var(--nadina-white);
        border-radius: 12px;
        box-shadow: 0 4px 24px var(--nadina-shadow-md);
        display: none;
        flex-direction: column;
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        animation: slideUp 0.3s ease-out;
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      #nadina-chat-window.open {
        display: flex;
      }

      #nadina-chat-header {
        background: linear-gradient(135deg, var(--nadina-primary) 0%, var(--nadina-primary-dark) 100%);
        padding: 16px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-radius: 12px 12px 0 0;
      }

      #nadina-header-content {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
      }

      #nadina-header-avatar {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        overflow: hidden;
        flex-shrink: 0;
        background: white;
      }

      #nadina-header-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      #nadina-header-info h3 {
        font-size: 15px;
        font-weight: 600;
        color: var(--nadina-white);
        margin-bottom: 2px;
      }

      #nadina-header-info p {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.85);
      }

      #nadina-close-button {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.15);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      }

      #nadina-close-button:hover {
        background: rgba(255, 255, 255, 0.25);
      }

      #nadina-close-button svg {
        width: 18px;
        height: 18px;
        fill: white;
      }

      #nadina-chat-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        background: var(--nadina-gray-50);
      }

      #nadina-chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        scroll-behavior: smooth;
      }

      #nadina-chat-messages::-webkit-scrollbar {
        width: 6px;
      }

      #nadina-chat-messages::-webkit-scrollbar-track {
        background: transparent;
      }

      #nadina-chat-messages::-webkit-scrollbar-thumb {
        background: var(--nadina-gray-300);
        border-radius: 3px;
      }

      .nadina-message {
        display: flex;
        gap: 10px;
        margin-bottom: 14px;
        animation: fadeIn 0.3s ease-out;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .nadina-message.nadina-user {
        flex-direction: row-reverse;
      }

      .nadina-message-avatar {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        overflow: hidden;
        flex-shrink: 0;
        background: var(--nadina-primary-light);
      }

      .nadina-message-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .nadina-message-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .nadina-message-bubble {
        padding: 10px 14px;
        border-radius: 12px;
        font-size: 14px;
        line-height: 1.5;
        max-width: 75%;
        word-wrap: break-word;
      }

      .nadina-message.nadina-assistant .nadina-message-bubble {
        background: var(--nadina-white);
        color: var(--nadina-gray-900);
        border: 1px solid var(--nadina-gray-200);
        border-radius: 12px 12px 12px 4px;
      }

      .nadina-message.nadina-user .nadina-message-bubble {
        background: linear-gradient(135deg, var(--nadina-primary) 0%, var(--nadina-primary-dark) 100%);
        color: var(--nadina-white);
        border-radius: 12px 12px 4px 12px;
        margin-left: auto;
      }

      .nadina-message-time {
        font-size: 11px;
        color: var(--nadina-gray-400);
        padding: 0 4px;
      }

      .nadina-message.nadina-user .nadina-message-time {
        text-align: right;
      }

      .nadina-whatsapp-button {
        background: #25D366 !important;
        color: white !important;
        border: none !important;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-weight: 500;
        transition: all 0.2s;
      }

      .nadina-whatsapp-button:hover {
        background: #20BA5A !important;
        transform: translateY(-1px);
      }

      #nadina-typing-indicator {
        display: none;
        padding: 10px 14px;
        background: var(--nadina-white);
        border: 1px solid var(--nadina-gray-200);
        border-radius: 12px 12px 12px 4px;
        max-width: 60px;
      }

      #nadina-typing-indicator.active {
        display: block;
      }

      .nadina-typing-dots {
        display: flex;
        gap: 4px;
        align-items: center;
      }

      .nadina-typing-dots span {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--nadina-gray-400);
        animation: bounce 1.4s infinite ease-in-out;
      }

      .nadina-typing-dots span:nth-child(1) {
        animation-delay: -0.32s;
      }

      .nadina-typing-dots span:nth-child(2) {
        animation-delay: -0.16s;
      }

      @keyframes bounce {
        0%, 80%, 100% {
          transform: scale(0);
        }
        40% {
          transform: scale(1);
        }
      }

      #nadina-quick-actions {
        padding: 12px 16px;
        background: var(--nadina-white);
        border-top: 1px solid var(--nadina-gray-200);
        display: flex;
        gap: 8px;
        overflow-x: auto;
        scrollbar-width: none;
      }

      #nadina-quick-actions::-webkit-scrollbar {
        display: none;
      }

      .nadina-quick-action {
        padding: 8px 12px;
        background: var(--nadina-gray-50);
        border: 1px solid var(--nadina-gray-200);
        border-radius: 8px;
        font-size: 13px;
        color: var(--nadina-gray-700);
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.2s;
        font-weight: 500;
      }

      .nadina-quick-action:hover {
        background: var(--nadina-primary-light);
        border-color: var(--nadina-primary);
        color: var(--nadina-primary-dark);
      }

      #nadina-input-wrapper {
        padding: 12px 16px 16px;
        background: var(--nadina-white);
        border-top: 1px solid var(--nadina-gray-200);
        display: flex;
        gap: 8px;
        align-items: flex-end;
      }

      #nadina-message-input {
        flex: 1;
        padding: 10px 12px;
        border: 1px solid var(--nadina-gray-300);
        border-radius: 10px;
        font-family: var(--nadina-font);
        font-size: 14px;
        resize: none;
        outline: none;
        min-height: 20px;
        max-height: 80px;
        transition: border-color 0.2s;
      }

      #nadina-message-input:focus {
        border-color: var(--nadina-primary);
      }

      #nadina-message-input::placeholder {
        color: var(--nadina-gray-400);
      }

      #nadina-send-button {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: linear-gradient(135deg, var(--nadina-primary) 0%, var(--nadina-primary-dark) 100%);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: all 0.2s;
      }

      #nadina-send-button:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px var(--nadina-shadow-md);
      }

      #nadina-send-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      #nadina-send-button svg {
        width: 20px;
        height: 20px;
        fill: white;
      }

      @media (max-width: 480px) {
        #nadina-widget {
          bottom: 0;
          right: 0;
          left: 0;
        }

        #nadina-chat-button {
          bottom: 16px;
          right: 16px;
          position: fixed;
        }

        #nadina-whatsapp-button {
          bottom: 16px;
          right: 72px;
        }

        #nadina-chat-window {
          bottom: 0;
          right: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          border-radius: 0;
          max-height: 100vh;
        }

        #nadina-chat-header {
          border-radius: 0;
        }
      }
    `;

    const styleEl = document.createElement('style');
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
  }

  // Crear HTML del widget
  function createWidget() {
    const widgetHTML = `
      <div id="nadina-widget">
        <button id="nadina-chat-button" aria-label="Abrir chat con Nadina">
          <img src="${CONFIG.AVATAR_URL}" alt="Nadina">
        </button>

        <button id="nadina-whatsapp-button" class="visible" aria-label="Ir a WhatsApp">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </button>

        <div id="nadina-chat-window">
          <div id="nadina-chat-header">
            <div id="nadina-header-content">
              <div id="nadina-header-avatar">
                <img src="${CONFIG.AVATAR_URL}" alt="Nadina">
              </div>
              <div id="nadina-header-info">
                <h3>Nadina</h3>
                <p>Asistente virtual de Nadin Lencería</p>
              </div>
            </div>
            <button id="nadina-close-button" aria-label="Cerrar chat">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>

          <div id="nadina-chat-body">
            <div id="nadina-chat-messages">
              <div class="nadina-message nadina-assistant">
                <div class="nadina-message-avatar">
                  <img src="${CONFIG.AVATAR_URL}" alt="Nadina">
                </div>
                <div class="nadina-message-content">
                  <div class="nadina-message-bubble">
                    ¡Hola! Soy Nadina, tu asistente virtual de Nadin Lencería 💕<br><br>
                    ¿En qué puedo ayudarte hoy?
                  </div>
                  <span class="nadina-message-time" id="nadina-welcome-time"></span>
                </div>
              </div>

              <div class="nadina-message nadina-assistant">
                <div class="nadina-message-avatar">
                  <img src="${CONFIG.AVATAR_URL}" alt="Nadina">
                </div>
                <div id="nadina-typing-indicator">
                  <div class="nadina-typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>

            <div id="nadina-quick-actions">
              <button class="nadina-quick-action" data-message="¿Cuáles son los horarios?">📅 Horarios</button>
              <button class="nadina-quick-action" data-message="¿Dónde están ubicados?">📍 Ubicación</button>
              <button class="nadina-quick-action" data-message="¿Tienen envíos?">📦 Envíos</button>
              <button class="nadina-quick-action" data-message="Quiero hablar con una vendedora">💬 Vendedora</button>
            </div>

            <div id="nadina-input-wrapper">
              <textarea 
                id="nadina-message-input" 
                placeholder="Escribí tu mensaje..."
                rows="1"
              ></textarea>
              <button id="nadina-send-button" aria-label="Enviar mensaje">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = widgetHTML;
    document.body.appendChild(tempDiv.firstElementChild);
  }

  // Lógica del widget (igual que antes pero adaptada)
  function initWidget() {
    const elements = {
      chatButton: document.getElementById('nadina-chat-button'),
      whatsappButton: document.getElementById('nadina-whatsapp-button'),
      chatWindow: document.getElementById('nadina-chat-window'),
      closeButton: document.getElementById('nadina-close-button'),
      messagesContainer: document.getElementById('nadina-chat-messages'),
      messageInput: document.getElementById('nadina-message-input'),
      sendButton: document.getElementById('nadina-send-button'),
      typingIndicator: document.getElementById('nadina-typing-indicator'),
      quickActions: document.querySelectorAll('.nadina-quick-action')
    };

    let conversationHistory = [];
    let sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    // Event listeners
    elements.chatButton.addEventListener('click', () => {
      elements.chatWindow.classList.toggle('open');
      if (elements.chatWindow.classList.contains('open')) {
        elements.messageInput.focus();
        logEvent('chat_opened');
      } else {
        logEvent('chat_closed');
      }
    });

    elements.closeButton.addEventListener('click', () => {
      elements.chatWindow.classList.remove('open');
      logEvent('chat_closed');
    });

    elements.whatsappButton.addEventListener('click', () => {
      window.open(`https://wa.me/${CONFIG.WHATSAPP_NUMBER}`, '_blank');
      logEvent('whatsapp_direct_click', { source: 'floating_button' });
    });

    elements.sendButton.addEventListener('click', sendMessage);
    elements.messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    elements.quickActions.forEach(button => {
      button.addEventListener('click', () => {
        elements.messageInput.value = button.getAttribute('data-message');
        sendMessage();
      });
    });

    async function sendMessage() {
      const message = elements.messageInput.value.trim();
      if (!message) return;

      elements.sendButton.disabled = true;
      elements.messageInput.value = '';

      addMessage('user', message);
      conversationHistory.push({ role: 'user', content: message });

      showTyping();

      try {
        const response = await fetch(CONFIG.API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, conversationHistory })
        });

        const data = await response.json();
        
        hideTyping();
        await sleep(300);

        addMessage('assistant', data.message);
        conversationHistory.push({ role: 'assistant', content: data.message });

        await logConversation(message, data.message, data);

        if (data.shouldDeriveToWhatsApp) {
          await sleep(800);
          addWhatsAppButton(data.whatsappNumber || CONFIG.WHATSAPP_NUMBER);
        }

      } catch (error) {
        console.error('Error:', error);
        hideTyping();
        addMessage('assistant', 'Ups, tuve un problema. ¿Te paso con una vendedora por WhatsApp?');
        await sleep(500);
        addWhatsAppButton(CONFIG.WHATSAPP_NUMBER);
      } finally {
        elements.sendButton.disabled = false;
      }
    }

    function addMessage(role, content) {
      const messageDiv = document.createElement('div');
      messageDiv.className = `nadina-message nadina-${role}`;

      if (role === 'assistant') {
        messageDiv.innerHTML = `
          <div class="nadina-message-avatar">
            <img src="${CONFIG.AVATAR_URL}" alt="Nadina">
          </div>
          <div class="nadina-message-content">
            <div class="nadina-message-bubble">${content}</div>
            <span class="nadina-message-time">${getCurrentTime()}</span>
          </div>
        `;
      } else {
        messageDiv.innerHTML = `
          <div class="nadina-message-content">
            <div class="nadina-message-bubble">${content}</div>
            <span class="nadina-message-time">${getCurrentTime()}</span>
          </div>
        `;
      }

      const typingMsg = elements.typingIndicator.closest('.nadina-message');
      elements.messagesContainer.insertBefore(messageDiv, typingMsg);
      scrollToBottom();
    }

    function addWhatsAppButton(phoneNumber) {
      const messageDiv = document.createElement('div');
      messageDiv.className = 'nadina-message nadina-assistant';
      messageDiv.innerHTML = `
        <div class="nadina-message-avatar">
          <img src="${CONFIG.AVATAR_URL}" alt="Nadina">
        </div>
        <div class="nadina-message-content">
          <div class="nadina-message-bubble nadina-whatsapp-button">💬 Hablar por WhatsApp</div>
        </div>
      `;

      messageDiv.querySelector('.nadina-whatsapp-button').onclick = () => {
        window.open(`https://wa.me/${phoneNumber}`, '_blank');
        logEvent('whatsapp_click', { source: 'chat_button' });
      };

      const typingMsg = elements.typingIndicator.closest('.nadina-message');
      elements.messagesContainer.insertBefore(messageDiv, typingMsg);
      scrollToBottom();
    }

    function showTyping() {
      elements.typingIndicator.classList.add('active');
      scrollToBottom();
    }

    function hideTyping() {
      elements.typingIndicator.classList.remove('active');
    }

    function scrollToBottom() {
      setTimeout(() => {
        elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
      }, 100);
    }

    async function logConversation(userMessage, aiResponse, metadata) {
      try {
        await fetch(CONFIG.LOG_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            timestamp: new Date().toISOString(),
            userMessage,
            aiResponse,
            shouldDeriveToWhatsApp: metadata.shouldDeriveToWhatsApp,
            tokensUsed: metadata.tokensUsed,
            url: window.location.href,
            userAgent: navigator.userAgent
          })
        });
      } catch (e) {
        console.warn('Error logging:', e);
      }
    }

    async function logEvent(eventType, metadata = {}) {
      try {
        await fetch(CONFIG.LOG_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            timestamp: new Date().toISOString(),
            eventType,
            metadata,
            url: window.location.href
          })
        });
      } catch (e) {
        console.warn('Error logging event:', e);
      }
    }

    function getCurrentTime() {
      return new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    }

    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Actualizar hora de bienvenida
    const welcomeTime = document.getElementById('nadina-welcome-time');
    if (welcomeTime) welcomeTime.textContent = getCurrentTime();
  }

  // Inicializar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      injectStyles();
      createWidget();
      initWidget();
    });
  } else {
    injectStyles();
    createWidget();
    initWidget();
  }
})();
