# 🤖 HR Assistant Platform with RAG Technology

منصة مساعد الموارد البشرية مع تقنية RAG للذكاء الاصطناعي

## 📋 Overview

This is a comprehensive HR Assistant Platform that combines traditional HR services with advanced RAG (Retrieval-Augmented Generation) technology. The system allows users to upload HR law documents and get intelligent, context-aware responses based on the uploaded content.

## ✨ Features

### 🏛️ HR Services
- **Digital Platforms Integration**: Qiwa and Ajeer platforms
- **Expert Consultants**: HR and legal experts
- **Team Information**: Development team profiles

### 🤖 AI-Powered RAG System
- **Document Upload**: Support for PDF and DOCX files
- **Intelligent Chunking**: Automatic document segmentation
- **Vector Embeddings**: OpenAI embeddings for semantic search
- **Context-Aware Responses**: GPT-3.5-turbo with document context
- **Source Citation**: Shows which documents were used for answers
- **Arabic Language Support**: Full RTL support and Arabic responses

### 🛠️ Technical Components
- **LangChain**: Document processing and AI orchestration
- **ChromaDB**: Vector database for embeddings storage
- **OpenAI API**: GPT-4o and embeddings
- **Express.js**: Backend server
- **Modern UI**: Responsive design with Arabic RTL support

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- OpenAI API key
- Modern web browser
- Live Server (VS Code extension) or similar local server

### Installation

1. **Clone or download the project**
   ```bash
   cd hrproject
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   OPENAI_MODEL=gpt-4o
   ```

4. **Add your law documents** 📚
   ```bash
   # Create the backend laws directory
   mkdir backend_laws
   
   # Add your Saudi labor law documents here:
   # - saudi_labor_law.pdf
   # - social_insurance_law.docx
   # - wage_protection_system.pdf
   # - etc.
   ```

5. **Start the API server**
   ```bash
   npm start
   ```

6. **Start your frontend server**
   - If using VS Code Live Server: Right-click `index.html` → "Open with Live Server"
   - Or use any local server on port 5500

7. **Access the system**
   - Frontend: `http://127.0.0.1:5500/index.html`
   - Admin Panel: `http://127.0.0.1:5500/admin.html`
   - API Server: `http://localhost:3001`

## 📚 How to Use

### 🏛️ Backend Law Setup (قوانين العمل)
1. **Add Law Files**: Place your Saudi labor law PDF/DOCX files in the `./backend_laws/` directory
2. **File Naming**: Use descriptive names like `saudi_labor_law.pdf`, `social_insurance_law.docx`
3. **Automatic Loading**: The server will automatically load and process these files on startup
4. **Security**: Law documents are stored server-side, users cannot modify them

### 👥 User Interface (واجهة المستخدم)
1. **Law Questions Mode**:
   - Click "📚 أسئلة قانونية" tab
   - Ask questions about Saudi labor laws
   - Get answers based on admin-uploaded laws

2. **Contract Analysis Mode**:
   - Click "📄 تحليل العقود" tab
   - Upload employment contracts for analysis
   - Get legal analysis and violation detection

### 3. Example Questions
**Law Questions**:
- "ما هي حقوق العامل في حالة الفصل التعسفي؟"
- "كيف يتم حساب الإجازة السنوية؟"
- "ما هي شروط العمل الإضافي؟"

**Contract Analysis**:
- "هل هذا العقد متوافق مع قانون العمل؟"
- "ما هي المخالفات القانونية في هذا العقد؟"
- "كيف يمكن تحسين هذا العقد؟"

## 🏗️ Architecture

```
Frontend (HTML/CSS/JS)
    ↓
Express.js Server
    ↓
LangChain Processing
    ↓
OpenAI Embeddings
    ↓
ChromaDB Vector Store
    ↓
GPT-4o (RAG)
```

## 📁 Project Structure

```
hrproject/
├── index.html          # Main application interface
├── admin.html          # Admin panel for law uploads
├── server.js           # Express.js backend server
├── rag-chat.js         # Frontend RAG chat system
├── package.json        # Node.js dependencies
├── env.example         # Environment variables template
├── backend_laws/       # 📚 Law documents (PDF/DOCX) - ADD YOUR FILES HERE
├── uploads/            # Admin law document uploads
├── contracts/          # User contract uploads
├── chroma_law_db/      # Law vector database
├── chroma_contract_db/ # Contract vector database
└── assets/             # Images and static files
    ├── hrlogo1.png
    ├── qiwa.jpeg
    ├── Ajeer.png
    └── ...
```

## 🔧 API Endpoints

### POST `/admin/upload-law`
Upload labor law documents (Admin only)
- **Input**: Multipart form with PDF/DOCX file
- **Output**: Processing status and chunk count

### POST `/upload-contract`
Upload employment contracts for analysis
- **Input**: Multipart form with PDF/DOCX file
- **Output**: Processing status and chunk count

### POST `/chat`
Send questions and get RAG-powered responses
- **Input**: JSON with message, chat history, and mode ('law' or 'contract')
- **Output**: AI response with source citations

### GET `/documents`
Get information about uploaded documents
- **Output**: Document count and status

### DELETE `/documents`
Clear all uploaded documents
- **Output**: Success confirmation

### GET `/health`
Server health check
- **Output**: Server status and vector store info

## 🎨 Customization

### Styling
The application uses CSS custom properties for easy theming:
```css
:root {
  --main-color: #1b5e20;      /* Primary green color */
  --card-bg: #ffffff;         /* Card background */
  --border-color: #e0e0e0;    /* Border color */
  --font: 'RYA', sans-serif;  /* Arabic font */
}
```

### Language Support
The system is designed for Arabic language with RTL support. To add other languages:
1. Update the system prompt in `server.js`
2. Modify the UI text in `rag-chat.js`
3. Adjust the text splitter for different languages

## 🔒 Security Considerations

- **File Validation**: Only PDF and DOCX files are accepted
- **Temporary Storage**: Uploaded files are processed and deleted
- **API Key Protection**: Store OpenAI API key in environment variables
- **Input Sanitization**: All user inputs are validated

## 🚀 Deployment

### Local Development
```bash
npm run dev  # Uses nodemon for auto-restart
```

### Production
```bash
npm start    # Standard Node.js start
```

### Environment Variables for Production
```bash
NODE_ENV=production
PORT=3000
OPENAI_API_KEY=your_production_api_key
```

## 📊 Performance Optimization

- **Chunk Size**: Optimized at 1000 characters with 200 overlap
- **Vector Search**: Retrieves top 5 most relevant chunks
- **Caching**: Vector store persists between server restarts
- **Async Processing**: Non-blocking document processing

## 🐛 Troubleshooting

### Common Issues

1. **"OpenAI API key not found"**
   - Check your `.env` file
   - Ensure the API key is valid

2. **"Document processing failed"**
   - Verify file format (PDF/DOCX only)
   - Check file size (recommend < 10MB)

3. **"Vector store not loading"**
   - Delete `chroma_db` folder and restart
   - Re-upload documents

4. **"Chat not responding"**
   - Check server logs for errors
   - Verify OpenAI API quota

### Debug Mode
Enable detailed logging by setting:
```bash
DEBUG=true
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 👥 Team

- **Reem Mohammed Al-Hizaa** - Team Leader & UI/UX Designer
- **Nasreen Mughram Al-Asmari** - AI & Programming Specialist  
- **Munira Nasser Al-Asiri** - Content & Photography

## 📞 Support

For technical support or questions:
- WhatsApp: +966 582968140 (Reem)
- LinkedIn: [Eng. Nejood A. Bin Eshaq](https://www.linkedin.com/in/nejood-a-eshaq-26a47b208/)

---

**Built with ❤️ for the Saudi HR Community** #   H R _ A S S I S T A N T 
 
 #   h r _ a s s i s t a n t 
 
 #   a s s i s t a n t _ h r 
 
 
