// config.js
module.exports = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  OPENAI_MODEL: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
  PORT: process.env.PORT || 3001,
  MAX_FILE_SIZE_MB: process.env.MAX_FILE_SIZE_MB || 20,
  CORS_ORIGINS: (process.env.CORS_ORIGINS || 'http://127.0.0.1:5500,http://localhost:5500,http://localhost:3000').split(','),
  UPLOADS_DIR: 'uploads',
  BACKEND_LAWS_DIR: 'backend_laws',
  CHUNK_SIZE: 1000,
  CHUNK_OVERLAP: 200
};
