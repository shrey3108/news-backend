const express = require('express');
const News = require('../models/News');
const router = express.Router();

// Create a new news article
router.post('/', async (req, res) => {
  try {
    const newsData = {
      ...req.body,
      views: 0,
      createdAt: new Date()
    };
    const news = new News(newsData);
    await news.save();

    // Broadcast to socket.io
    const io = req.app.get('io');
    io.to(news.category).emit('news', news);

    res.status(201).json(news);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get news by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 10, page = 1 } = req.query;

    const news = await News.find({ category })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((page - 1) * limit);

    const total = await News.countDocuments({ category });

    res.json({
      news,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get trending news across categories
// Trending News Aggregation Pipeline
router.get('/trending', async (req, res) => {
  try {
    // Advanced trending news aggregation
    const trendingNews = await News.aggregate([
      // Filter news from last 24 hours
      { 
        $match: { 
          createdAt: { 
            $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) 
          } 
        } 
      },
      // Group by category and calculate metrics
      {
        $group: {
          _id: '$category',
          totalViews: { $sum: '$views' },
          newsCount: { $sum: 1 },
          topNews: { 
            $top: { 
              output: '$$ROOT', 
              sortBy: { views: -1 } 
            } 
          }
        }
      },
      // Sort categories by total views
      { $sort: { totalViews: -1 } },
      // Limit to top 5 categories
      { $limit: 5 },
      // Project final result
      {
        $project: {
          category: '$_id',
          totalViews: 1,
          newsCount: 1,
          topNews: {
            title: 1,
            content: 1,
            views: 1,
            createdAt: 1
          }
        }
      }
    ]);

    res.json({
      trendingNews,
      timestamp: new Date(),
      message: 'Trending news retrieved successfully'
    });
  } catch (error) {
    console.error('Trending News Error:', error);
    res.status(500).json({ 
      message: 'Error retrieving trending news', 
      error: error.message 
    });
  }
});

// Increment news views when accessed
router.patch('/:id/view', async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(
      req.params.id, 
      { $inc: { views: 1 } }, 
      { new: true }
    );
    
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }
    
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update news views
router.patch('/:id/view', async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(
      req.params.id, 
      { $inc: { views: 1 } }, 
      { new: true }
    );
    res.json(news);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
