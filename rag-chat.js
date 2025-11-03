// RAG Chat System for HR Assistant - Dual Mode (Law Questions + Contract Analysis)
class RAGChatSystem {
    constructor() {
        this.chatHistory = [];
        this.isLoading = false;
        this.currentMode = 'law'; // 'law' or 'contract'
        this.apiBaseUrl = 'http://127.0.0.1:3001';
        this.init();
    }

    init() {
        this.createChatInterface();
        this.bindEvents();
        this.loadDocumentInfo();
    }

    createChatInterface() {
        // Create chat container
        const chatContainer = document.createElement('div');
        chatContainer.id = 'rag-chat-container';
        chatContainer.className = 'rag-chat-container';
        chatContainer.innerHTML = `
            <div class="chat-header">
                <h3>🤖 مساعد قوانين الموارد البشرية</h3>
                <div class="mode-selector">
                    <button class="mode-btn active" data-mode="law" onclick="ragChat.switchMode('law')">
                        📚 أسئلة قانونية
                    </button>
                    <button class="mode-btn" data-mode="contract" onclick="ragChat.switchMode('contract')">
                        📄 تحليل العقود
                    </button>
                </div>
                <div class="document-info" id="document-info">
                    <span>📄 لم يتم تحميل أي وثائق</span>
                </div>
            </div>
            
            <div class="upload-section" id="upload-section">
                <div class="upload-area" id="upload-area">
                    <div class="upload-content">
                        <div class="upload-icon">📁</div>
                        <h4 id="upload-title">تحميل العقد</h4>
                        <p id="upload-description">اسحب وأفلت ملفات هنا، أو اضغط للاختيار</p>
                        <input type="file" id="file-input" accept=".pdf,.docx" multiple style="display: none;">
                        <button class="upload-btn" onclick="document.getElementById('file-input').click()">
                            اختيار الملفات
                        </button>
                    </div>
                </div>
                <div class="upload-progress" id="upload-progress" style="display: none;">
                    <div class="progress-bar">
                        <div class="progress-fill" id="progress-fill"></div>
                    </div>
                    <p id="progress-text">جاري معالجة الملف...</p>
                </div>
            </div>

            <div class="chat-messages" id="chat-messages">
                <div class="welcome-message">
                    <div class="message bot">
                        <div class="message-content">
                            <p>مرحباً! أنا مساعدك المتخصص في قوانين العمل السعودية. 🏛️</p>
                            <p>يمكنني مساعدتك في:</p>
                            <ul>
                                <li>🔍 البحث في قوانين العمل السعودية</li>
                                <li>📋 تفسير المواد القانونية</li>
                                <li>💼 تحليل عقود العمل</li>
                                <li>⚖️ كشف المخالفات القانونية</li>
                            </ul>
                            <p>اختر الوضع المناسب من الأعلى وابدأ!</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="chat-input-section">
                <div class="input-container">
                    <textarea 
                        id="chat-input" 
                        placeholder="اكتب سؤالك هنا..."
                        rows="3"
                    ></textarea>
                    <button id="send-btn" class="send-btn" disabled>
                        <span class="send-icon">📤</span>
                    </button>
                </div>
            </div>

            <div class="sources-section" id="sources-section" style="display: none;">
                <h4>📚 المصادر المستخدمة:</h4>
                <div id="sources-list"></div>
            </div>

            <div class="chat-actions">
                <button class="action-btn" onclick="ragChat.clearChat()">
                    🗑️ مسح المحادثة
                </button>
                <button class="action-btn" onclick="ragChat.clearDocuments()">
                    📄 مسح الوثائق
                </button>
            </div>
        `;

        // Add styles
        const styles = document.createElement('style');
        styles.textContent = `
            .rag-chat-container {
                position: fixed;
                bottom: 80px;
                left: 20px;
                width: 450px;
                height: 650px;
                background: white;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                display: flex;
                flex-direction: column;
                z-index: 10000;
                font-family: 'RYA', sans-serif;
                border: 2px solid #1b5e20;
                overflow: hidden;
            }

            .chat-header {
                background: linear-gradient(135deg, #1b5e20, #43A047);
                color: white;
                padding: 15px;
                text-align: center;
                border-radius: 13px 13px 0 0;
            }

            .chat-header h3 {
                margin: 0 0 15px 0;
                font-size: 1.1rem;
            }

            .mode-selector {
                display: flex;
                gap: 10px;
                margin-bottom: 15px;
                justify-content: center;
            }

            .mode-btn {
                background: rgba(255,255,255,0.2);
                border: 1px solid rgba(255,255,255,0.3);
                color: white;
                padding: 8px 15px;
                border-radius: 20px;
                cursor: pointer;
                font-family: 'RYA', sans-serif;
                font-size: 0.85rem;
                transition: all 0.3s ease;
            }

            .mode-btn:hover {
                background: rgba(255,255,255,0.3);
            }

            .mode-btn.active {
                background: white;
                color: #1b5e20;
                font-weight: bold;
            }

            .document-info {
                font-size: 0.9rem;
                opacity: 0.9;
            }

            .upload-section {
                padding: 15px;
                border-bottom: 1px solid #e0e0e0;
            }

            .upload-area {
                border: 2px dashed #1b5e20;
                border-radius: 10px;
                padding: 20px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .upload-area:hover {
                background: #f0f8f0;
                border-color: #43A047;
            }

            .upload-area.dragover {
                background: #e8f5e9;
                border-color: #43A047;
            }

            .upload-icon {
                font-size: 2rem;
                margin-bottom: 10px;
            }

            .upload-content h4 {
                margin: 0 0 10px 0;
                color: #1b5e20;
            }

            .upload-content p {
                margin: 0 0 15px 0;
                color: #666;
                font-size: 0.9rem;
            }

            .upload-btn {
                background: #1b5e20;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-family: 'RYA', sans-serif;
            }

            .upload-btn:hover {
                background: #43A047;
            }

            .upload-progress {
                margin-top: 15px;
            }

            .progress-bar {
                width: 100%;
                height: 8px;
                background: #e0e0e0;
                border-radius: 4px;
                overflow: hidden;
            }

            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #1b5e20, #43A047);
                width: 0%;
                transition: width 0.3s ease;
            }

            .chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 15px;
                background: #f9f9f9;
            }

            .message {
                margin-bottom: 15px;
                display: flex;
            }

            .message.user {
                justify-content: flex-end;
            }

            .message-content {
                max-width: 80%;
                padding: 12px 16px;
                border-radius: 15px;
                font-size: 0.9rem;
                line-height: 1.4;
            }

            .message.bot .message-content {
                background: white;
                border: 1px solid #e0e0e0;
                border-radius: 15px 15px 15px 5px;
            }

            .message.user .message-content {
                background: #1b5e20;
                color: white;
                border-radius: 15px 15px 5px 15px;
            }

            .welcome-message ul {
                margin: 10px 0;
                padding-right: 20px;
            }

            .welcome-message li {
                margin: 5px 0;
            }

            .chat-input-section {
                padding: 15px;
                border-top: 1px solid #e0e0e0;
                background: white;
            }

            .input-container {
                display: flex;
                gap: 10px;
                align-items: flex-end;
            }

            #chat-input {
                flex: 1;
                border: 1px solid #e0e0e0;
                border-radius: 10px;
                padding: 12px;
                font-family: 'RYA', sans-serif;
                resize: none;
                outline: none;
            }

            #chat-input:focus {
                border-color: #1b5e20;
            }

            .send-btn {
                background: #1b5e20;
                color: white;
                border: none;
                padding: 12px 15px;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .send-btn:hover:not(:disabled) {
                background: #43A047;
            }

            .send-btn:disabled {
                background: #ccc;
                cursor: not-allowed;
            }

            .sources-section {
                padding: 15px;
                border-top: 1px solid #e0e0e0;
                background: #f5f5f5;
                max-height: 150px;
                overflow-y: auto;
            }

            .sources-section h4 {
                margin: 0 0 10px 0;
                color: #1b5e20;
                font-size: 0.9rem;
            }

            .source-item {
                background: white;
                padding: 10px;
                margin: 5px 0;
                border-radius: 5px;
                border-right: 3px solid #1b5e20;
                font-size: 0.8rem;
            }

            .source-item.law {
                border-right-color: #1b5e20;
            }

            .source-item.contract {
                border-right-color: #ff6b35;
            }

            .source-file {
                font-weight: bold;
                color: #1b5e20;
            }

            .source-type {
                font-size: 0.7rem;
                color: #666;
                margin-top: 2px;
            }

            .source-content {
                color: #666;
                margin-top: 5px;
            }

            .chat-actions {
                padding: 10px 15px;
                display: flex;
                gap: 10px;
                border-top: 1px solid #e0e0e0;
                background: #f9f9f9;
            }

            .action-btn {
                background: #f0f0f0;
                border: 1px solid #ddd;
                padding: 8px 12px;
                border-radius: 5px;
                cursor: pointer;
                font-family: 'RYA', sans-serif;
                font-size: 0.8rem;
                transition: all 0.3s ease;
            }

            .action-btn:hover {
                background: #e0e0e0;
            }

            .loading {
                display: flex;
                align-items: center;
                gap: 10px;
                color: #666;
                font-style: italic;
            }

            .loading-dots {
                display: flex;
                gap: 3px;
            }

            .loading-dots span {
                width: 6px;
                height: 6px;
                background: #1b5e20;
                border-radius: 50%;
                animation: loading 1.4s infinite ease-in-out;
            }

            .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
            .loading-dots span:nth-child(2) { animation-delay: -0.16s; }

            @keyframes loading {
                0%, 80%, 100% { transform: scale(0); }
                40% { transform: scale(1); }
            }

            .rag-chat-container.minimized {
                height: 60px;
                overflow: hidden;
            }

            .minimize-btn {
                position: absolute;
                top: 10px;
                right: 10px;
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                padding: 5px 8px;
                border-radius: 3px;
                cursor: pointer;
                font-size: 0.8rem;
            }
        `;

        document.head.appendChild(styles);
        document.body.appendChild(chatContainer);
    }

    switchMode(mode) {
        this.currentMode = mode;
        
        // Update UI
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
        
        // Update upload section
        const uploadTitle = document.getElementById('upload-title');
        const uploadDescription = document.getElementById('upload-description');
        const chatInput = document.getElementById('chat-input');
        
        if (mode === 'law') {
            uploadTitle.textContent = '📚 قوانين العمل المحملة مسبقاً';
            uploadDescription.textContent = 'القوانين محملة من الخادم. يمكنك طرح الأسئلة مباشرة.';
            chatInput.placeholder = 'اسأل عن قوانين العمل السعودية...';
            this.hideUploadSection(); // Hide for law questions
        } else {
            uploadTitle.textContent = 'تحميل عقد العمل للتحليل';
            uploadDescription.textContent = 'اسحب وأفلت عقد العمل هنا للتحليل القانوني';
            chatInput.placeholder = 'اسأل عن تحليل العقد أو المخالفات القانونية...';
            this.showUploadSection();
        }
        
        // Clear chat and reload document info
        this.clearChat();
        this.loadDocumentInfo();
    }

    hideUploadSection() {
        const uploadSection = document.getElementById('upload-section');
        uploadSection.style.display = 'none';
    }

    showUploadSection() {
        const uploadSection = document.getElementById('upload-section');
        uploadSection.style.display = 'block';
    }

    bindEvents() {
        // File upload events
        const fileInput = document.getElementById('file-input');
        const uploadArea = document.getElementById('upload-area');

        fileInput.addEventListener('change', (e) => this.handleFileUpload(e.target.files));
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            this.handleFileUpload(e.dataTransfer.files);
        });

        // Chat input events
        const chatInput = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-btn');

        chatInput.addEventListener('input', () => {
            sendBtn.disabled = !chatInput.value.trim();
        });

        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        sendBtn.addEventListener('click', () => this.sendMessage());
    }

    async handleFileUpload(files) {
        if (files.length === 0) return;

        const progressBar = document.getElementById('upload-progress');
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        const uploadArea = document.getElementById('upload-area');

        progressBar.style.display = 'block';
        uploadArea.style.display = 'none';

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const progress = ((i + 1) / files.length) * 100;
            
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `جاري معالجة: ${file.name}`;

            try {
                await this.uploadFile(file);
            } catch (error) {
                console.error('Upload error:', error);
                this.addMessage('bot', `❌ خطأ في تحميل الملف: ${file.name}`);
            }
        }

        // Reset UI
        setTimeout(() => {
            progressBar.style.display = 'none';
            uploadArea.style.display = 'block';
            progressFill.style.width = '0%';
            this.loadDocumentInfo();
        }, 1000);
    }

    async uploadFile(file) {
        const formData = new FormData();
        formData.append('document', file);
        
        // Add type based on current mode
        if (this.currentMode === 'law') {
            formData.append('type', 'law');
        } else {
            formData.append('type', 'contract');
        }

        const endpoint = this.currentMode === 'law' ? '/admin/upload-law' : '/upload-contract';
        
        const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            this.addMessage('bot', `✅ ${result.message}\nتم إنشاء ${result.chunks} جزء من النص`);
        } else {
            throw new Error(result.error);
        }
    }

    async sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (!message || this.isLoading) return;

        // Add user message
        this.addMessage('user', message);
        input.value = '';
        document.getElementById('send-btn').disabled = true;

        // Show loading
        this.isLoading = true;
        this.addLoadingMessage();

        try {
            const response = await fetch(`${this.apiBaseUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    history: this.chatHistory,
                    mode: this.currentMode
                })
            });

            const result = await response.json();

            // Remove loading message
            this.removeLoadingMessage();

            if (result.response) {
                this.addMessage('bot', result.response);
                
                // Show sources if available
                if (result.sources && result.sources.length > 0) {
                    this.showSources(result.sources);
                }
            } else {
                this.addMessage('bot', '❌ عذراً، حدث خطأ في معالجة رسالتك');
            }

        } catch (error) {
            console.error('Chat error:', error);
            this.removeLoadingMessage();
            this.addMessage('bot', '❌ عذراً، حدث خطأ في الاتصال');
        }

        this.isLoading = false;
    }

    addMessage(sender, content) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${content.replace(/\n/g, '<br>')}</p>
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Add to history
        this.chatHistory.push({
            role: sender === 'user' ? 'user' : 'assistant',
            content: content
        });
    }

    addLoadingMessage() {
        const messagesContainer = document.getElementById('chat-messages');
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message bot';
        loadingDiv.id = 'loading-message';
        
        const loadingText = this.currentMode === 'law' ? 'جاري البحث في قوانين العمل' : 'جاري تحليل العقد';
        
        loadingDiv.innerHTML = `
            <div class="message-content">
                <div class="loading">
                    <span>${loadingText}</span>
                    <div class="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;

        messagesContainer.appendChild(loadingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    removeLoadingMessage() {
        const loadingMessage = document.getElementById('loading-message');
        if (loadingMessage) {
            loadingMessage.remove();
        }
    }

    showSources(sources) {
        const sourcesSection = document.getElementById('sources-section');
        const sourcesList = document.getElementById('sources-list');
        
        sourcesList.innerHTML = '';
        
        sources.forEach(source => {
            const sourceDiv = document.createElement('div');
            sourceDiv.className = `source-item ${source.type}`;
            sourceDiv.innerHTML = `
                <div class="source-file">📄 ${source.fileName}</div>
                <div class="source-type">${source.type === 'law' ? 'قانون عمل' : 'عقد'}</div>
                <div class="source-content">${source.content}</div>
            `;
            sourcesList.appendChild(sourceDiv);
        });
        
        sourcesSection.style.display = 'block';
    }

    async loadDocumentInfo() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/documents`);
            const result = await response.json();
            
            const documentInfo = document.getElementById('document-info');
            if (result.lawDocuments > 0 || result.contractDocuments > 0) {
                let info = '';
                if (result.lawDocuments > 0) {
                    info += `📚 ${result.lawDocuments} قانون`;
                }
                if (result.contractDocuments > 0) {
                    if (info) info += ' | ';
                    info += `📄 ${result.contractDocuments} عقد`;
                }
                documentInfo.innerHTML = `<span>${info}</span>`;
            } else {
                documentInfo.innerHTML = `<span>📄 لم يتم تحميل أي وثائق</span>`;
            }
        } catch (error) {
            console.error('Error loading document info:', error);
        }
    }

    clearChat() {
        const messagesContainer = document.getElementById('chat-messages');
        const welcomeMessage = messagesContainer.querySelector('.welcome-message');
        
        messagesContainer.innerHTML = '';
        if (welcomeMessage) {
            messagesContainer.appendChild(welcomeMessage);
        }
        
        this.chatHistory = [];
        document.getElementById('sources-section').style.display = 'none';
    }

    async clearDocuments() {
        const type = this.currentMode;
        const typeText = type === 'law' ? 'قوانين العمل' : 'العقود';
        
        if (confirm(`هل أنت متأكد من حذف جميع ${typeText}؟`)) {
            try {
                const response = await fetch(`${this.apiBaseUrl}/documents`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ type: type })
                });
                const result = await response.json();
                
                this.addMessage('bot', result.message);
                this.loadDocumentInfo();
            } catch (error) {
                console.error('Error clearing documents:', error);
                this.addMessage('bot', '❌ خطأ في حذف الوثائق');
            }
        }
    }
}

// Initialize RAG Chat System
let ragChat;
document.addEventListener('DOMContentLoaded', () => {
    ragChat = new RAGChatSystem();

    // 🔹 إخفاء الشات عند بداية الصفحة
    const container = document.getElementById('rag-chat-container');
    container.style.display = 'none';

    // 🔹 إخفاء رفع العقد افتراضيًا عند البداية (في وضع الأسئلة القانونية)
    ragChat.hideUploadSection();

    // 🔹 إنشاء زر لتفعيل المساعد الذكي (لو ما هو موجود)
    if (!document.getElementById('activate-chat-btn')) {
        const btn = document.createElement('button');
        btn.id = 'activate-chat-btn';
        btn.innerHTML = '🤖 تفعيل المساعد الذكي';
        btn.style.position = 'fixed';
        btn.style.bottom = '15px';
        btn.style.left = '20px';
        btn.style.background = '#1b5e20';
        btn.style.color = 'white';
        btn.style.padding = '12px 20px';
        btn.style.borderRadius = '25px';
        btn.style.border = 'none';
        btn.style.cursor = 'pointer';
        btn.style.fontFamily = 'RYA, sans-serif';
        btn.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';
        btn.style.zIndex = '9999';
        btn.onclick = () => triggerAvatar();
        document.body.appendChild(btn);
    }
});


// Global function for the trigger button
function triggerAvatar() {
    const container = document.getElementById('rag-chat-container');
    if (container) {
        container.style.display = container.style.display === 'none' ? 'flex' : 'none';
    }
} 