const axios = require('axios');
const BaseService = require('./BaseService');

class LLStudioService {
  constructor() {
    // LMStudio configuration
    this.apiKey = process.env.LLSTUDIO_API_KEY || 'lm-studio';
    this.baseURL = process.env.LLSTUDIO_BASE_URL || 'http://localhost:1234/v1';
    
    // Mistral model configurations
    this.embeddingModel = process.env.LLSTUDIO_EMBEDDING_MODEL || 'nomic-ai/nomic-embed-text-v1.5-GGUF';
    this.chatModel = process.env.LLSTUDIO_CHAT_MODEL || 'mistralai/Mistral-7B-Instruct-v0.3-GGUF';
    
    // Alternative Mistral models
    this.availableModels = {
      chat: [
        'mistralai/Mistral-7B-Instruct-v0.3-GGUF',
        'mistralai/Mistral-7B-Instruct-v0.2-GGUF',
        'mistralai/Mixtral-8x7B-Instruct-v0.1-GGUF',
        'mistralai/Mixtral-8x22B-Instruct-v0.1-GGUF'
      ],
      embedding: [
        'nomic-ai/nomic-embed-text-v1.5-GGUF',
        'sentence-transformers/all-MiniLM-L6-v2',
        'BAAI/bge-small-en-v1.5-GGUF'
      ]
    };
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 60000 // Increased timeout for local models
    });
  }

  /**
   * Get available models from LMStudio
   * @returns {Promise<Array>} - List of available models
   */
  async getAvailableModels() {
    try {
      const response = await this.client.get('/models');
      return response.data.data || [];
    } catch (error) {
      console.warn('Could not fetch models from LMStudio:', error.message);
      return this.availableModels;
    }
  }

  /**
   * Generate embeddings for text using LMStudio/Mistral
   * @param {string} text - Text to embed
   * @param {string} model - Optional model override
   * @returns {Promise<Array>} - Embedding vector
   */
  async generateEmbedding(text, model = null) {
    try {
      const requestModel = model || this.embeddingModel;
      
      const response = await this.client.post('/embeddings', {
        input: text,
        model: requestModel,
        encoding_format: 'float'
      });
      
      return response.data.data[0].embedding;
    } catch (error) {
      throw new Error(`LMStudio embedding error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Generate embeddings for multiple texts
   * @param {Array<string>} texts - Array of texts to embed
   * @param {string} model - Optional model override
   * @returns {Promise<Array<Array>>} - Array of embedding vectors
   */
  async generateBatchEmbeddings(texts, model = null) {
    try {
      const requestModel = model || this.embeddingModel;
      
      const response = await this.client.post('/embeddings', {
        input: texts,
        model: requestModel,
        encoding_format: 'float'
      });
      
      return response.data.data.map(item => item.embedding);
    } catch (error) {
      throw new Error(`LMStudio batch embedding error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Generate chat completion using Mistral models in LMStudio
   * @param {Array} messages - Chat messages array
   * @param {Object} options - Additional options
   * @returns {Promise<string>} - Generated response
   */
  async generateChatCompletion(messages, options = {}) {
    try {
      const requestData = {
        model: options.model || this.chatModel,
        messages: this.formatMessagesForMistral(messages),
        max_tokens: options.maxTokens || 2000,
        temperature: options.temperature || 0.7,
        top_p: options.topP || 0.9,
        frequency_penalty: options.frequencyPenalty || 0,
        presence_penalty: options.presencePenalty || 0,
        stop: options.stop || ['</s>', '[INST]', '[/INST]']
      };
      console.log('Request data:', requestData);
      const response = await this.client.post('/chat/completions', requestData);
      
      return response.data.choices[0].message.content.trim();
    } catch (error) {
      throw new Error(`LMStudio chat completion error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Format messages for Mistral instruction format
   * @param {Array} messages - Original messages
   * @returns {Array} - Formatted messages
   */
  formatMessagesForMistral(messages) {
    return messages.map(msg => {
      if (msg.role === 'system') {
        // Mistral doesn't have explicit system role, prepend to first user message
        return {
          role: 'user',
          content: `[INST] ${msg.content} [/INST]`
        };
      }
      return msg;
    });
  }

  /**
   * Generate streaming chat completion with Mistral
   * @param {Array} messages - Chat messages array
   * @param {Object} options - Additional options
   * @returns {Promise<ReadableStream>} - Streaming response
   */
  async generateStreamingChatCompletion(messages, options = {}) {
    try {
      const requestData = {
        model: options.model || this.chatModel,
        messages: this.formatMessagesForMistral(messages),
        max_tokens: options.maxTokens || 2000,
        temperature: options.temperature || 0.7,
        top_p: options.topP || 0.9,
        stream: true,
        stop: options.stop || ['</s>', '[INST]', '[/INST]']
      };

      const response = await this.client.post('/chat/completions', requestData, {
        responseType: 'stream'
      });
      
      return response.data;
    } catch (error) {
      throw new Error(`LMStudio streaming error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Generate RAG-optimized prompt for Mistral
   * @param {string} query - User query
   * @param {string} context - Retrieved context
   * @param {string} systemPrompt - System instructions
   * @returns {Array} - Formatted messages for Mistral
   */
  generateRAGPrompt(query, context, systemPrompt = null) {
    const defaultSystemPrompt = `You are a helpful AI assistant. Use the provided context to answer the user's question accurately and concisely. If the context doesn't contain relevant information, say so clearly.`;
    
    const prompt = `[INST] ${systemPrompt || defaultSystemPrompt}

Context:
${context}

Question: ${query} [/INST]`;
    
    return [{
      role: 'user',
      content: prompt
    }];
  }

  /**
   * Calculate cosine similarity between two vectors
   * @param {Array} vectorA - First vector
   * @param {Array} vectorB - Second vector
   * @returns {number} - Cosine similarity score
   */
  calculateCosineSimilarity(vectorA, vectorB) {
    if (vectorA.length !== vectorB.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      normA += vectorA[i] * vectorA[i];
      normB += vectorB[i] * vectorB[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Find similar embeddings using cosine similarity
   * @param {Array} queryEmbedding - Query embedding vector
   * @param {Array} embeddings - Array of {id, embedding, metadata} objects
   * @param {number} topK - Number of top results to return
   * @param {number} threshold - Minimum similarity threshold
   * @returns {Array} - Array of similar embeddings with scores
   */
  findSimilarEmbeddings(queryEmbedding, embeddings, topK = 5, threshold = 0.7) {
    const similarities = embeddings.map(item => ({
      ...item,
      similarity: this.calculateCosineSimilarity(queryEmbedding, item.embedding)
    }));

    return similarities
      .filter(item => item.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  /**
   * Test connection to LMStudio
   * @returns {Promise<boolean>} - Connection status
   */
  async testConnection() {
    try {
      const response = await this.client.get('/models');
      console.log('LMStudio connection successful. Available models:', response.data.data?.length || 0);
      return true;
    } catch (error) {
      console.error('LMStudio connection test failed:', error.message);
      return false;
    }
  }

  /**
   * Get model information
   * @param {string} modelName - Model name to get info for
   * @returns {Promise<Object>} - Model information
   */
  async getModelInfo(modelName) {
    try {
      const models = await this.getAvailableModels();
      return models.find(model => model.id === modelName) || null;
    } catch (error) {
      console.error('Error getting model info:', error.message);
      return null;
    }
  }
}

module.exports = LLStudioService;