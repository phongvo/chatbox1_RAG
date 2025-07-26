const BaseService = require('./BaseService');
const LLStudioService = require('./LLStudioService');
const Embedding = require('../models/Embedding');

class EmbeddingService extends BaseService {
  constructor() {
    super(Embedding);
    this.llStudioService = new LLStudioService();
  }

  /**
   * Create and store embedding for text
   * @param {string} content - Text content to embed
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Created embedding document
   */
  async createEmbedding(content, options = {}) {
    try {
      // Generate embedding using LMStudio
      const embeddingVector = await this.llStudioService.generateEmbedding(content, options.model);
      
      // Create embedding document
      const embeddingData = {
        content,
        embedding: embeddingVector,
        metadata: options.metadata || {},
        source: options.source || 'manual',
        sourceId: options.sourceId,
        sourceModel: options.sourceModel,
        model: options.model || this.llStudioService.embeddingModel,
        dimensions: embeddingVector.length
      };
      
      return await this.create(embeddingData);
    } catch (error) {
      throw new Error(`Error creating embedding: ${error.message}`);
    }
  }

  /**
   * Create embeddings for multiple texts
   * @param {Array<Object>} items - Array of {content, metadata, source, etc.}
   * @returns {Promise<Array>} - Array of created embedding documents
   */
  async createBatchEmbeddings(items) {
    try {
      const contents = items.map(item => item.content);
      const embeddingVectors = await this.llStudioService.generateBatchEmbeddings(contents);
      
      const embeddingDocs = items.map((item, index) => ({
        content: item.content,
        embedding: embeddingVectors[index],
        metadata: item.metadata || {},
        source: item.source || 'manual',
        sourceId: item.sourceId,
        sourceModel: item.sourceModel,
        model: item.model || this.llStudioService.embeddingModel,
        dimensions: embeddingVectors[index].length
      }));
      
      return await this.model.insertMany(embeddingDocs);
    } catch (error) {
      throw new Error(`Error creating batch embeddings: ${error.message}`);
    }
  }

  /**
   * Search for similar embeddings
   * @param {string} query - Search query text
   * @param {Object} options - Search options
   * @returns {Promise<Array>} - Array of similar embeddings with scores
   */
  async searchSimilar(query, options = {}) {
    try {
      const {
        limit = 5,
        threshold = 0.7,
        source = null,
        metadata = null
      } = options;
      
      // Generate embedding for query
      const queryEmbedding = await this.llStudioService.generateEmbedding(query);
      
      // Build filter
      const filter = { isActive: true };
      if (source) filter.source = source;
      if (metadata) {
        Object.keys(metadata).forEach(key => {
          filter[`metadata.${key}`] = metadata[key];
        });
      }
      
      // Get all embeddings (in production, you'd want to use vector database)
      const embeddings = await this.findAll(filter);
      
      // Calculate similarities
      const similarities = embeddings.map(embedding => ({
        ...embedding.toObject(),
        similarity: this.llStudioService.calculateCosineSimilarity(
          queryEmbedding,
          embedding.embedding
        )
      }));
      
      // Filter and sort by similarity
      return similarities
        .filter(item => item.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);
    } catch (error) {
      throw new Error(`Error searching embeddings: ${error.message}`);
    }
  }

  /**
   * Generate RAG response using Mistral models
   * @param {string} query - User query
   * @param {Object} options - RAG options
   * @returns {Promise<Object>} - Generated response with context
   */
  async generateRAGResponse(query, options = {}) {
    try {
      const {
        maxContext = 3,
        temperature = 0.7,
        systemPrompt = 'You are a helpful AI assistant. Use the provided context to answer the user\'s question accurately and concisely. If the context doesn\'t contain relevant information, say so clearly.',
        model = null
      } = options;
      
      // Find similar embeddings
      const similarEmbeddings = await this.searchSimilar(query, {
        limit: maxContext,
        threshold: 0.6
      });
      
      // Build context from similar embeddings
      const context = similarEmbeddings
        .map((item, index) => `[${index + 1}] ${item.content}`)
        .join('\n\n');
      
      // Use Mistral-optimized RAG prompt
      const messages = this.llStudioService.generateRAGPrompt(query, context, systemPrompt);
      
      // Generate response using Mistral
      const response = await this.llStudioService.generateChatCompletion(messages, {
        temperature,
        model,
        maxTokens: 1500
      });
      
      return {
        response,
        context: similarEmbeddings,
        query,
        model: model || this.llStudioService.chatModel
      };
    } catch (error) {
      throw new Error(`Error generating RAG response: ${error.message}`);
    }
  }

  /**
   * Generate streaming RAG response
   * @param {string} query - User query
   * @param {Object} options - RAG options
   * @returns {Promise<ReadableStream>} - Streaming response
   */
  async generateStreamingRAGResponse(query, options = {}) {
    try {
      const {
        maxContext = 3,
        temperature = 0.7,
        systemPrompt = 'You are a helpful AI assistant. Use the provided context to answer the user\'s question accurately and concisely.',
        model = null
      } = options;
      
      // Find similar embeddings
      const similarEmbeddings = await this.searchSimilar(query, {
        limit: maxContext,
        threshold: 0.6
      });
      
      // Build context
      const context = similarEmbeddings
        .map((item, index) => `[${index + 1}] ${item.content}`)
        .join('\n\n');
      
      // Use Mistral-optimized RAG prompt
      const messages = this.llStudioService.generateRAGPrompt(query, context, systemPrompt);
      
      // Generate streaming response
      return await this.llStudioService.generateStreamingChatCompletion(messages, {
        temperature,
        model,
        maxTokens: 1500
      });
    } catch (error) {
      throw new Error(`Error generating streaming RAG response: ${error.message}`);
    }
  }

  /**
   * Delete embeddings by source
   * @param {string} source - Source type
   * @param {string} sourceId - Source ID
   * @returns {Promise<Object>} - Deletion result
   */
  async deleteBySource(source, sourceId) {
    try {
      return await this.model.deleteMany({ source, sourceId });
    } catch (error) {
      throw new Error(`Error deleting embeddings by source: ${error.message}`);
    }
  }

  /**
   * Test LMStudio connection and models
   * @returns {Promise<Object>} - Connection and model status
   */
  async testLMStudioConnection() {
    try {
      const isConnected = await this.llStudioService.testConnection();
      const models = await this.llStudioService.getAvailableModels();
      
      return {
        connected: isConnected,
        models: models,
        embeddingModel: this.llStudioService.embeddingModel,
        chatModel: this.llStudioService.chatModel
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message
      };
    }
  }

  /**
   * Process document and create embeddings
   * @param {Object} documentData - Document information
   * @returns {Promise<Object>} - Processing result
   */
  async processDocumentForEmbedding(documentData) {
    try {
      const { content, filename, fileSize, mimeType } = documentData;
      
      // Chunk the content
      const chunks = this.chunkText(content, {
        chunkSize: 300,
        overlap: 50
      });
      
      // Create embeddings for all chunks
      const embeddingItems = chunks.map((chunk, index) => ({
        content: chunk,
        metadata: {
          filename,
          fileSize,
          mimeType,
          chunkIndex: index,
          totalChunks: chunks.length,
          uploadedAt: new Date().toISOString()
        },
        source: 'document',
        sourceModel: 'Document'
      }));
      
      const embeddings = await this.createBatchEmbeddings(embeddingItems);
      
      return {
        filename,
        totalChunks: chunks.length,
        embeddingsCreated: embeddings.length,
        fileSize,
        embeddings: embeddings.map(emb => ({
          id: emb._id,
          content: emb.content.substring(0, 100) + '...',
          dimensions: emb.dimensions
        }))
      };
    } catch (error) {
      throw new Error(`Error processing document: ${error.message}`);
    }
  }

  /**
   * Chunk text into smaller pieces
   * @param {string} text - Text to chunk
   * @param {Object} options - Chunking options
   * @returns {Array<string>} - Array of text chunks
   */
  chunkText(text, options = {}) {
    const { chunkSize = 300, overlap = 50 } = options;
    const words = text.split(/\s+/);
    const chunks = [];
    
    for (let i = 0; i < words.length; i += chunkSize - overlap) {
      const chunk = words.slice(i, i + chunkSize).join(' ');
      if (chunk.trim().length > 0) {
        chunks.push(chunk.trim());
      }
    }
    
    return chunks;
  }
}

module.exports = EmbeddingService;