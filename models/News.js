const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Tech', 'Business', 'Sports', 'Entertainment', 'General']
  },
  author: {
    type: String,
    default: 'Anonymous'
  },
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexing for performance
NewsSchema.index({ category: 1, createdAt: -1 });
NewsSchema.index({ views: -1 });

// Static method for trending news
NewsSchema.statics.getTrendingNews = async function(limit = 10) {
  return this.aggregate([
    { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
    { $group: {
      _id: '$category',
      topNews: { $top: { output: '$$ROOT', sortBy: { views: -1 } } }
    }},
    { $replaceRoot: { newRoot: '$topNews' } },
    { $limit: limit }
  ]);
};

// Middleware to increment views
NewsSchema.pre('find', function() {
  this.options.runValidators = true;
});

const News = mongoose.model('News', NewsSchema);
module.exports = News;
