const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const socketIo = require('socket.io');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
require('dotenv').config();

const News = require('./models/News');
const newsRoutes = require('./routes/news');
const userRoutes = require('./routes/user');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" }
});

// Middleware
app.use(cors());
app.use(express.json());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// MongoDB Connection with Enhanced Logging
mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log('MongoDB Connected Successfully'))
.catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/news', newsRoutes);
app.use('/api/users', userRoutes);

// Root route handler
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Real-Time News Backend',
    status: 'Running',
    timestamp: new Date().toISOString(),
    documentation: '/api-docs',
    endpoints: [
      '/api/news',
      '/api/users'
    ]
  });
});

// Socket.io Connection Management
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Subscribe to news categories
  socket.on('subscribe', (category) => {
    console.log(`Client ${socket.id} subscribed to ${category}`);
    socket.join(category);
  });

  // Broadcast news to specific category
  socket.on('news', async (newsData) => {
    try {
      // Validate and sanitize news data
      const validatedNews = {
        title: newsData.title || 'Untitled News',
        content: newsData.content || 'No content available',
        category: newsData.category || 'General',
        author: newsData.author || 'Anonymous',
        views: 0,
        createdAt: new Date()
      };

      const news = new News(validatedNews);
      await news.save();
      
      // Broadcast to all clients and specific category room
      io.emit('news', news);
      io.to(news.category).emit('news', news);
      
      console.log(`✅ News Broadcasted: ${news.title} in ${news.category}`);
    } catch (error) {
      console.error('❌ News Broadcast Error:', error);
      socket.emit('news_error', { message: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
