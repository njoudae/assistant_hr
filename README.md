# 🤖 HR Assistant Platform with RAG Technology  
منصة مساعد الموارد البشرية المدعومة بتقنيات الذكاء الاصطناعي RAG & OCR & LLM  
---

## 📋 Overview

The **HR Assistant Platform** is an intelligent system that merges traditional HR operations with advanced **Retrieval-Augmented Generation (RAG)**, **OCR** and **LLM** technology.  
It enables users to upload **Saudi Labor Law documents** and receive **context-aware, Arabic-language legal answers** based directly on the uploaded material.

---

## 🧰 Tools & Packages Used

### 🔹 Backend
- **Node.js** — JavaScript runtime  
- **Express.js** — Web server framework  
- **LangChain.js** — LLM orchestration and document processing  
- **ChromaDB** — Vector store for embeddings  
- **OpenAI SDK** — GPT-4o + Embedding models  
- **Multer** — File upload handling  
- **FS-Extra** — File management utilities  
- **UUID** — Unique identifiers for documents  
- **Dotenv** — Secure environment variable management  

### 🔹 Frontend
- **HTML5 / CSS3 / JavaScript (ES6)**  
- **Responsive Arabic RTL design**  
- **Modern UI** with clean dark/light theme  
- **Font:** RYA / Tajawal  

---


## ✨ Key Features

### 🏛️ HR Services
- **Integration with Qiwa and Ajeer** platforms  
- **HR & Legal Consultation**: Instant expert-level answers  
- **Team Profiles**: Professional team showcase  

### 🤖 AI-Powered RAG System
- 📄 **Upload PDFs / DOCX** documents  
- 🧩 **Automatic Chunking & Embedding** for semantic understanding  
- 🧠 **GPT-4o + LangChain** pipeline for reasoning and retrieval  
- 🔎 **Source Citation** for transparency  
- 🇸🇦 **Arabic Language Support (RTL)** full interface  

---

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


## 📊 Performance Optimization

- **Chunk Size**: Optimized at 1000 characters with 200 overlap
- **Vector Search**: Retrieves top 5 most relevant chunks
- **Caching**: Vector store persists between server restarts
- **Async Processing**: Non-blocking document processing


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
- **Nejood A. Bin Eshaq** - AI Engineer & AI researcher
- **Nasreen Mughram Al-Asmari** - Graghical Designer
- **Munira Nasser Al-Asiri** - Content & Photography

## 📞 Support

For technical support or questions:
- WhatsApp: +966 582968140 (Nejood)
- LinkedIn: [Eng. Nejood A. Bin Eshaq](https://www.linkedin.com/in/nejood-a-eshaq-26a47b208/)

---

**Built with ❤️ for the Saudi HR Community**



