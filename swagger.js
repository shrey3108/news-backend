const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Real-Time News Feed API',
      version: '1.0.0',
      description: 'API documentation for Real-Time News Feed Application',
      contact: {
        name: 'Developer Support',
        email: 'support@newsfeed.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local development server'
      }
    ]
  },
  apis: ['./routes/*.js', './models/*.js']
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
