const { EmbeddingService, LLStudioService } = require('../services');
const { asyncHandler } = require('../middleware/errorHandler');
const fs = require('fs');

class ChatController {
  constructor() {
    this.embeddingService = new EmbeddingService();
    this.llStudioService = new LLStudioService();
  }

  // Send chat message to LMStudio with Mistral model
  sendChatMessage = asyncHandler(async (req, res) => {
    console.log('Begin function: sendChatMessage');
    const { message, model, temperature, maxTokens, useRAG = false } = req.body;
    
    if (!message) {
      console.log('End function: sendChatMessage - Missing message');
      return res.status(400).json({ error: 'Message is required' });
    }

    try {
      let response;
      
      if (useRAG) {
        // Use RAG with embeddings
        const ragResponse = await this.embeddingService.generateRAGResponse(message, {
          temperature: temperature || 0.7,
          model: model || 'mistralai/Mistral-7B-Instruct-v0.3-GGUF',
          maxTokens: maxTokens || 1500
        });
        
        response = {
          response: ragResponse.response,
          model: ragResponse.model,
          context: ragResponse.context.map(ctx => ({
            content: ctx.content,
            similarity: ctx.similarity,
            source: ctx.source
          })),
          useRAG: true
        };
      } else {
        // Direct chat without RAG
        const messages = [
          {
            role: 'user',
            content: message
          }
        ];
        
        const chatResponse = await this.llStudioService.generateChatCompletion(messages, {
          temperature: temperature || 0.7,
          model: model || 'mistralai/Mistral-7B-Instruct-v0.3-GGUF',
          maxTokens: maxTokens || 1500
        });
        
        response = {
          response: chatResponse,
          model: model || 'mistralai/Mistral-7B-Instruct-v0.3-GGUF',
          useRAG: false
        };
      }
      
      console.log('End function: sendChatMessage - Success');
      res.json({
        success: true,
        data: response,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.log('End function: sendChatMessage - Error:', error.message);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Send streaming chat message
  sendStreamingChatMessage = asyncHandler(async (req, res) => {
    console.log('Begin function: sendStreamingChatMessage');
    const { message, model, temperature, maxTokens, useRAG = false } = req.body;
    
    if (!message) {
      console.log('End function: sendStreamingChatMessage - Missing message');
      return res.status(400).json({ error: 'Message is required' });
    }

    try {
      // Set headers for streaming
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

      if (useRAG) {
        // Use RAG with streaming
        const stream = await this.embeddingService.generateStreamingRAGResponse(message, {
          temperature: temperature || 0.7,
          model: model || 'mistralai/Mistral-7B-Instruct-v0.3-GGUF',
          maxTokens: maxTokens || 1500
        });
        
        stream.on('data', (chunk) => {
          const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              res.write(line + '\n\n');
            }
          }
        });
        
        stream.on('end', () => {
          console.log('End function: sendStreamingChatMessage - Stream ended');
          res.write('data: [DONE]\n\n');
          res.end();
        });
        
        stream.on('error', (error) => {
          console.log('End function: sendStreamingChatMessage - Stream error:', error.message);
          res.write(`data: {"error": "${error.message}"}\n\n`);
          res.end();
        });
      } else {
        // Direct streaming without RAG
        const messages = [
          {
            role: 'user',
            content: message
          }
        ];
        
        const stream = await this.llStudioService.generateStreamingChatCompletion(messages, {
          temperature: temperature || 0.7,
          model: model || 'mistralai/Mistral-7B-Instruct-v0.3-GGUF',
          maxTokens: maxTokens || 1500
        });
        
        stream.on('data', (chunk) => {
          const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              res.write(line + '\n\n');
            }
          }
        });
        
        stream.on('end', () => {
          console.log('End function: sendStreamingChatMessage - Stream ended');
          res.write('data: [DONE]\n\n');
          res.end();
        });
        
        stream.on('error', (error) => {
          console.log('End function: sendStreamingChatMessage - Stream error:', error.message);
          res.write(`data: {"error": "${error.message}"}\n\n`);
          res.end();
        });
      }
    } catch (error) {
      console.log('End function: sendStreamingChatMessage - Error:', error.message);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Multi-turn conversation
  sendConversation = asyncHandler(async (req, res) => {
    console.log('Begin function: sendConversation');
    const { messages, model, temperature, maxTokens, useRAG = false } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.log('End function: sendConversation - Invalid messages');
      return res.status(400).json({ error: 'Messages array is required' });
    }

    try {
      let response;
      
      if (useRAG) {
        // For RAG, use the last user message as query
        const lastUserMessage = messages.filter(msg => msg.role === 'user').pop();
        if (!lastUserMessage) {
          console.log('End function: sendConversation - No user message for RAG');
          return res.status(400).json({ error: 'No user message found for RAG' });
        }
        
        const ragResponse = await this.embeddingService.generateRAGResponse(lastUserMessage.content, {
          temperature: temperature || 0.7,
          model: model || 'mistralai/Mistral-7B-Instruct-v0.3-GGUF',
          maxTokens: maxTokens || 1500
        });
        
        response = {
          response: ragResponse.response,
          model: ragResponse.model,
          context: ragResponse.context.map(ctx => ({
            content: ctx.content,
            similarity: ctx.similarity,
            source: ctx.source
          })),
          useRAG: true
        };
      } else {
        // Multi-turn conversation without RAG
        const chatResponse = await this.llStudioService.generateChatCompletion(messages, {
          temperature: temperature || 0.7,
          model: model || 'mistralai/Mistral-7B-Instruct-v0.3-GGUF',
          maxTokens: maxTokens || 1500
        });
        
        response = {
          response: chatResponse,
          model: model || 'mistralai/Mistral-7B-Instruct-v0.3-GGUF',
          useRAG: false
        };
      }
      
      console.log('End function: sendConversation - Success');
      res.json({
        success: true,
        data: response,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.log('End function: sendConversation - Error:', error.message);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Get available models
  getAvailableModels = asyncHandler(async (req, res) => {
    console.log('Begin function: getAvailableModels');
    try {
      const models = await this.llStudioService.getAvailableModels();
      
      console.log('End function: getAvailableModels - Success');
      res.json({
        success: true,
        data: {
          models: models,
          defaultChatModel: this.llStudioService.chatModel,
          defaultEmbeddingModel: this.llStudioService.embeddingModel
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.log('End function: getAvailableModels - Error:', error.message);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Test LMStudio connection
  testConnection = asyncHandler(async (req, res) => {
    console.log('Begin function: testConnection');
    try {
      const status = await this.embeddingService.testLMStudioConnection();
      
      console.log('End function: testConnection - Success');
      res.json({
        success: true,
        data: status,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.log('End function: testConnection - Error:', error.message);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Create embedding for text
  createEmbedding = asyncHandler(async (req, res) => {
    console.log('Begin function: createEmbedding');
    const { text, metadata, source } = req.body;
    
    if (!text) {
      console.log('End function: createEmbedding - Missing text');
      return res.status(400).json({ error: 'Text is required' });
    }

    try {
      const embedding = await this.embeddingService.createEmbedding(text, {
        metadata: metadata || {},
        source: source || 'api'
      });
      
      console.log('End function: createEmbedding - Success');
      res.status(201).json({
        success: true,
        data: {
          id: embedding._id,
          content: embedding.content,
          dimensions: embedding.dimensions,
          model: embedding.model,
          source: embedding.source,
          metadata: embedding.metadata
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.log('End function: createEmbedding - Error:', error.message);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Search similar embeddings
  searchSimilar = asyncHandler(async (req, res) => {
    console.log('Begin function: searchSimilar');
    const { query, limit, threshold } = req.body;
    
    if (!query) {
      console.log('End function: searchSimilar - Missing query');
      return res.status(400).json({ error: 'Query is required' });
    }

    try {
      const results = await this.embeddingService.searchSimilar(query, {
        limit: limit || 5,
        threshold: threshold || 0.7
      });
      
      console.log('End function: searchSimilar - Success');
      res.json({
        success: true,
        data: {
          query: query,
          results: results.map(result => ({
            id: result._id,
            content: result.content,
            similarity: result.similarity,
            source: result.source,
            metadata: result.metadata
          }))
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.log('End function: searchSimilar - Error:', error.message);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Upload and process document
  uploadDocument = asyncHandler(async (req, res) => {
    console.log('Begin function: uploadDocument');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
  
    try {
      const { originalname, path: filePath, mimetype, size } = req.file;
      
      // Validate file type
      const allowedTypes = [
        'text/plain',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/json'
      ];
      
      if (!allowedTypes.includes(mimetype)) {
        fs.unlinkSync(filePath); // Clean up
        return res.status(400).json({ 
          error: `Unsupported file type: ${mimetype}. Supported types: PDF, TXT, DOCX, JSON` 
        });
      }
      
      // Extract text from file
      const textContent = await this.extractTextFromFile(filePath, mimetype);
      
      // Process and create embeddings
      const result = await this.embeddingService.processDocumentForEmbedding({
        content: textContent,
        filename: originalname,
        fileSize: size,
        mimeType: mimetype
      });
      
      // Clean up uploaded file
      fs.unlinkSync(filePath);
      
      console.log('End function: uploadDocument - Success');
      res.status(201).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      // Clean up file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      console.log('End function: uploadDocument - Error:', error.message);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // Enhanced helper method for text extraction
  async extractTextFromFile(filePath, mimeType) {
    const fs = require('fs');
    
    try {
      switch (mimeType) {
        case 'text/plain':
          return fs.readFileSync(filePath, 'utf8');
        
        case 'application/pdf':
          const pdfParse = require('pdf-parse');
          const pdfBuffer = fs.readFileSync(filePath);
          const pdfData = await pdfParse(pdfBuffer);
          return pdfData.text;
        
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          const mammoth = require('mammoth');
          const docxResult = await mammoth.extractRawText({ path: filePath });
          return docxResult.value;
        
        case 'application/json':
          const jsonContent = fs.readFileSync(filePath, 'utf8');
          const jsonData = JSON.parse(jsonContent);
          
          // Handle different JSON structures
          if (Array.isArray(jsonData)) {
            // Array of objects - extract text from each
            return jsonData.map(item => {
              if (typeof item === 'string') return item;
              if (item.content) return item.content;
              if (item.text) return item.text;
              return JSON.stringify(item);
            }).join('\n\n');
          } else if (typeof jsonData === 'object') {
            // Single object - extract meaningful text
            if (jsonData.content) return jsonData.content;
            if (jsonData.text) return jsonData.text;
            if (jsonData.documents && Array.isArray(jsonData.documents)) {
              return jsonData.documents.map(doc => 
                doc.content || doc.text || JSON.stringify(doc)
              ).join('\n\n');
            }
            // Fallback: stringify the entire object
            return JSON.stringify(jsonData, null, 2);
          } else {
            return String(jsonData);
          }
        
        default:
          throw new Error(`Unsupported file type: ${mimeType}`);
      }
    } catch (error) {
      if (error.name === 'SyntaxError' && mimeType === 'application/json') {
        throw new Error('Invalid JSON format in uploaded file');
      }
      throw new Error(`Error extracting text from ${mimeType}: ${error.message}`);
    }
  }
}

module.exports = new ChatController();