const mongoose = require('mongoose');

const embeddingSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  embedding: {
    type: [Number],
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  source: {
    type: String,
    enum: ['document', 'message', 'manual'],
    default: 'manual'
  },
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'sourceModel'
  },
  sourceModel: {
    type: String,
    enum: ['Message', 'User', 'Document']
  },
  model: {
    type: String,
    default: 'text-embedding-ada-002'
  },
  dimensions: {
    type: Number,
    default: 1536
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for vector similarity search
embeddingSchema.index({ embedding: 1 });
embeddingSchema.index({ source: 1, isActive: 1 });
embeddingSchema.index({ sourceId: 1, sourceModel: 1 });
embeddingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Embedding', embeddingSchema);