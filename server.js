// server.js (CommonJS)
const express = require('express');

const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const config = require('./config');
require('dotenv').config();
console.log('🔑 OpenAI key loaded?', !!process.env.OPENAI_API_KEY);


// LangChain
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || config.OPENAI_API_KEY
});
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { PDFLoader } = require('langchain/document_loaders/fs/pdf');
const { DocxLoader } = require('langchain/document_loaders/fs/docx');

const app = express();
const PORT = config.PORT;

// Middleware
app.use(cors({
  origin: config.CORS_ORIGINS,
  credentials: true, methods: ['GET','POST','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.static('.'));

// Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), config.UPLOADS_DIR);
    fs.ensureDirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `${uuidv4()}-${file.originalname}`)
});
const upload = multer({
  storage,
  limits: { fileSize: (Number(config.MAX_FILE_SIZE_MB) * 1024 * 1024) },
  fileFilter: (req, file, cb) => {
    const ok = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (ok.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Only PDF/DOCX files are allowed'));
  }
});

// LLM & Embeddings
// ✅ نستخدم عميل OpenAI الرسمي بدل LangChain في إنشاء المحادثات والتضمين


// دالة لتوليد Embeddings مباشرة (بديل عن OpenAIEmbeddings)
async function createEmbedding(text) {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text
  });
  return res.data[0].embedding;
}


// Simple in-memory storage instead of ChromaDB
let lawDocuments = [];
let contractDocuments = [];

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: config.CHUNK_SIZE, chunkOverlap: config.CHUNK_OVERLAP,
  separators: ['\n\n','\n',' ','']
});

// دالة لحساب التشابه الكوني (cosine similarity) يدويًا
function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (magA * magB);
}

// دالة البحث المحسنة بالتضمين (Embeddings)
async function embeddingSimilaritySearch(query, documents, topK = 5) {
  const queryEmbedding = await createEmbedding(query);

  const scored = [];
  for (const doc of documents) {
    // نأخذ أول 1000 حرف فقط من النص لتقليل التكلفة
    const text = doc.pageContent.slice(0, 1000);
    const docEmbedding = await createEmbedding(text);
    const score = cosineSimilarity(queryEmbedding, docEmbedding);
    scored.push({ ...doc, score });
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}




async function ensureExistingCollections() {
  try {
    console.log('📝 Using simple in-memory storage (no ChromaDB needed)');
    console.log('📊 Law documents:', lawDocuments.length);
    console.log('📊 Contract documents:', contractDocuments.length);
  } catch (e) {
    console.error('Init collections error:', e.message);
  }
}

async function loadDocsFromBackend() {
  // تحميل قوانين جاهزة من مجلد backend_laws عند أول تشغيل (اختياري)
  const dir = path.join(process.cwd(), config.BACKEND_LAWS_DIR);
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.pdf') || f.endsWith('.docx'));
  if (!files.length) return;

  console.log(`📚 Found ${files.length} backend law files`);

  for (const f of files) {
    try {
      const p = path.join(dir, f);
      const loader = f.endsWith('.pdf') ? new PDFLoader(p) : new DocxLoader(p);
      const docs = await loader.load();
      const chunks = await splitter.splitDocuments(docs);
      chunks.forEach(d => d.metadata = { ...(d.metadata||{}), type:'law', fileName:f, source:'backend_laws' });
      
      // Add to simple storage instead of ChromaDB
      lawDocuments = lawDocuments.concat(chunks);
      console.log(`✅ Loaded ${chunks.length} chunks from ${f}`);
    } catch (error) {
      console.error(`❌ Error loading ${f}:`, error.message);
    }
  }
  
  console.log(`📊 Total law documents loaded: ${lawDocuments.length} chunks`);
}

// ====== رفع القوانين ======
app.post('/admin/upload-law', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success:false, error:'No file uploaded' });

    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const loader = fileName.endsWith('.pdf') ? new PDFLoader(filePath) : new DocxLoader(filePath);
    const docs = await loader.load();
    const chunks = await splitter.splitDocuments(docs);
    
    chunks.forEach(d => d.metadata = { ...(d.metadata||{}), type:'law', fileName, source:'upload/admin' });

    // Add to simple storage instead of ChromaDB
    lawDocuments = lawDocuments.concat(chunks);

    await fs.remove(filePath);
    res.json({ 
      success:true, 
      message:`تم تحميل قانون: ${fileName}`, 
      chunks: chunks.length, 
      type:'law',
      totalChunks: lawDocuments.length
    });
  } catch (e) {
    console.error('upload-law error:', e);
    res.status(500).json({ success:false, error: e.message });
  }
});

// ====== رفع عقد للتحليل (نسخة مبسطة بدون pdf2pic) ======
app.post('/upload-contract', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });

    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const ext = path.extname(fileName).toLowerCase();

    const Tesseract = require('tesseract.js');
    let textContent = '';

    // 📄 إذا كان الملف صورة (jpg, png, jpeg)
    if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      console.log('🧠 Running OCR on image...');
      const { data: { text } } = await Tesseract.recognize(filePath, 'ara+eng', {
        logger: m => process.stdout.write(`\r📄 OCR progress: ${Math.round(m.progress * 100)}%`)
      });
      textContent = text;
    }
    // 📃 إذا كان DOCX
    else if (ext === '.docx') {
      console.log('📄 Reading DOCX content...');
      const { DocxLoader } = require('langchain/document_loaders/fs/docx');
      const loader = new DocxLoader(filePath);
      const docs = await loader.load();
      textContent = docs.map(d => d.pageContent).join('\n');
    }
    // 🧾 إذا كان PDF (بدون تحويل لصور)
    else if (ext === '.pdf') {
      console.log('📘 Extracting text from PDF...');
      const pdfParse = require('pdf-parse');
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      textContent = pdfData.text;
    } else {
      throw new Error('❌ نوع الملف غير مدعوم. ارفع صورة أو DOCX أو PDF فقط.');
    }

    if (!textContent.trim()) throw new Error('❌ لم يتم استخراج أي نص من الملف.');

    // ✂️ تقسيم النص إلى أجزاء (chunks)
    const chunks = await splitter.splitDocuments([{ pageContent: textContent }]);
    chunks.forEach(d => d.metadata = { ...(d.metadata || {}), type: 'contract', fileName, source: 'upload/user' });

    // تخزين الأجزاء في الذاكرة
    contractDocuments = contractDocuments.concat(chunks);
    await fs.remove(filePath);

    res.json({
      success: true,
      message: `✅ تم تحميل وتحليل العقد: ${fileName}`,
      chunks: chunks.length,
      totalChunks: contractDocuments.length
    });

  } catch (e) {
    console.error('upload-contract error:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});


// ====== OCR استخراج نص من صور أو PDF ======
app.post('/ocr/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'لم يتم رفع أي ملف' });
    }

    const filePath = req.file.path;
    const ext = path.extname(filePath).toLowerCase();
    let text = '';

    // إذا PDF نحاول أولاً القراءة النصية
    if (ext === '.pdf') {
      try {
        const pdfBuffer = fs.readFileSync(filePath);
        const pdf = await require('pdf-parse')(pdfBuffer);
        text = pdf.text?.trim() || '';
      } catch (err) {
        console.warn('PDF parse failed, fallback to OCR:', err.message);
      }
    }

    // إن فشل أو الملف صورة، نستخدم OCR العربي
    if (!text || text.length < 20) {
      console.log('🧠 Running Arabic OCR...');
      const { data: { text: ocrText } } = await Tesseract.recognize(filePath, 'ara', {
        logger: m => process.stdout.write(`\r📄 OCR progress: ${Math.round(m.progress * 100)}%`)
      });
      text = ocrText.trim();
    }

    // تنظيف النص
    text = text.replace(/\s+/g, ' ').trim();
    await fs.remove(filePath);

    if (!text || text.length < 10) {
      return res.json({ success: false, error: 'لم يتم استخراج نص واضح من الملف.' });
    }

    res.json({
      success: true,
      message: 'تم استخراج النص بنجاح ✅',
      textSnippet: text.slice(0, 400) + (text.length > 400 ? '...' : ''),
      text
    });
  } catch (e) {
    console.error('OCR error:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});


// ====== الدردشة RAG ======
app.post('/chat', async (req, res) => {
  try {
    const { message, history = [], mode = 'law' } = req.body || {};
    if (!message) return res.status(400).json({ error:'Message is required' });

    let documents = [];
    if (mode === 'law') {
      if (lawDocuments.length === 0) {
        return res.json({ 
          response:'لم تُحمّل قوانين بعد. يرجى رفعها من لوحة الإدارة.', 
          sources:[] 
        });
      }
      documents = lawDocuments;
    } else if (mode === 'contract') {
      if (contractDocuments.length === 0) {
        return res.json({ 
          response:'لم يتم رفع عقد للتحليل بعد. ارفع العقد أولاً.', 
          sources:[] 
        });
      }
      documents = contractDocuments;
    }

    // Use simple similarity search instead of ChromaDB
    const results = await embeddingSimilaritySearch(message, documents, 6);


    if (results.length === 0) {
      return res.json({ 
        response:'لم أجد معلومات ذات صلة في الوثائق المحملة. حاول صياغة السؤال بطريقة مختلفة.', 
        sources:[] 
      });
    }

    const context = results.map((r,i) =>
      `[#${i+1}] (${r.metadata?.type} | ${r.metadata?.fileName})\n${r.pageContent}`
    ).join('\n\n');

    const system = `
أنت مساعد قانوني سعودي يعتمد على سياق RAG فقط. أجب بالعربية بدقة.
- أجب بسرعة ودقة
- لا تختلق معلومات. إن لم تجد جوابًا واضحًا من السياق فقل ذلك.
- أجب أجابة كامل عن السؤال وعن مايترتب عليه من احكام قانونيه مثل (اذا استقلت وعقدك محدد المدة ستدفع ماتبق من العقد)
- اختم بـ "المصادر:" مع [#] واسم الملف.
`;

    // Fix: Use direct OpenAI API call to avoid LangChain message format issues
    const contractContext = req.body.contract_text ? `\n\n【مقتطفات من العقد】\n${req.body.contract_text}` : '';
    const prompt = `${system}\n\nسؤال:\n${message}\n\nالسياق:\n${context}${contractContext || ''}`;

    console.log('📝 Sending to OpenAI:', { message, mode, resultsCount: results.length });

    

    const completion = await openai.chat.completions.create({
      model: config.OPENAI_MODEL,
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 1000
    });

    const ai = { content: completion.choices[0].message.content };
    const sources = results.map((r,i) => ({
      type: r.metadata?.type || mode,
      fileName: r.metadata?.fileName || 'غير معروف',
      content: r.pageContent.slice(0, 400) + (r.pageContent.length > 400 ? '...' : ''),
      ref: `#${i+1}`
    }));

    res.json({ response: ai.content, sources });
  } catch (e) {
    console.error('chat error:', e);
    res.status(500).json({ error:'Chat failed', details: e.message });
  }
});

// ====== الإحصائيات ======
app.get('/documents', async (req, res) => {
  try {
    res.json({ 
      lawDocuments: lawDocuments.length, 
      contractDocuments: contractDocuments.length 
    });
  } catch (e) {
    console.error('documents error:', e);
    res.status(500).json({ error:'Cannot read counts', details: e.message });
  }
});

// ====== الحذف ======
app.delete('/documents', async (req, res) => {
  try {
    const { type } = req.body || {};
    if (!type || type === 'law') {
      lawDocuments = [];
    }
    if (!type || type === 'contract') {
      contractDocuments = [];
    }
    res.json({ message: `تم حذف ${type || 'جميع'} الوثائق بنجاح` });
  } catch (e) {
    console.error('clear error:', e);
    res.status(500).json({ error:'Delete failed', details: e.message });
  }
});

// ====== الصحة ======
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    law: lawDocuments.length,
    contract: contractDocuments.length,
    ts: new Date().toISOString()
  });
});




// ===== Initialize documents =====
async function initializeDocuments() {
  try {
    await ensureExistingCollections();
    await loadDocsFromBackend();
    console.log('✅ Documents initialization complete');
  } catch (err) {
    console.error('❌ Error initializing documents:', err);
  }
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  // Load documents in background
  initializeDocuments()
    .then(() => console.log('✅ Documents ready'))
    .catch(err => console.error('❌ Init error:', err));
});

