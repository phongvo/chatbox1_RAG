const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const { swaggerUi, swaggerDocument, isEnabled } = require('./config/swagger');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5050;

// Basic middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chatbox_rag';

async function connectToMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected');
    return true;
  } catch (error) {
    console.error('❌ MongoDB failed:', error.message);
    return false;
  }
}

// Routes
app.use('/api', require('./routes'));

// FORCE SWAGGER TO WORK
console.log('🔧 Setting up Swagger UI (FORCED ENABLED)...');
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerDocument));
console.log(`📖 Swagger UI FORCED at: http://localhost:${PORT}/api-docs`);

// Basic routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Server running!',
    swagger: `http://localhost:${PORT}/api-docs`
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Start server
async function startServer() {
  const mongoConnected = await connectToMongoDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
    console.log(`🏠 Home: http://localhost:${PORT}/`);
  });
}

startServer().catch(console.error);