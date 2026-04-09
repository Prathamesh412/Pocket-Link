const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  url: {
    type: String,
    required: true,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  aiDescription: {
    type: String,
    default: '',
    trim: true,
  },
  aiTags: [{
    type: String,
    lowercase: true,
    trim: true,
  }],
  image: {
    type: String,
    default: null,
  },
  bucket: {
    type: String,
    enum: ['Watchlist', 'Kitchen', 'Reading', 'Reference', 'Inbox'],
    default: 'Inbox',
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true,
  }],
  readingTime: {
    type: Number,
    default: 0, // in minutes
  },
  streamingService: {
    type: String,
    enum: ['Netflix', 'YouTube', 'Crunchyroll', 'Other', null],
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for better search performance
linkSchema.index({ userId: 1, bucket: 1 });
linkSchema.index({ userId: 1, title: 'text', description: 'text' });

module.exports = mongoose.model('Link', linkSchema);
