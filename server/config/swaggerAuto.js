const path = require('path');
const SwaggerAutoGenerator = require('../utils/swaggerAutoGen');
const swaggerUi = require('swagger-ui-express');

class AutoSwaggerConfig {
  constructor() {
    this.generator = new SwaggerAutoGenerator();
    this.spec = null;
  }

  async generateDocumentation(options = {}) {
    const routesDir = path.join(__dirname, '../routes');
    
    const defaultOptions = {
      title: 'Chatbox RAG API - Auto Generated',
      version: '1.0.0',
      description: 'Automatically generated API documentation from route analysis',
      servers: [
        {
          url: 'http://localhost:5000',
          description: 'Development server'
        },
        {
          url: 'https://api.chatboxrag.com',
          description: 'Production server'
        }
      ],
      schemas: {
        Message: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'Message ID' },
            content: { type: 'string', description: 'Message content' },
            sender: { type: 'string', description: 'Message sender' },
            messageType: { type: 'string', enum: ['user', 'bot'] },
            timestamp: { type: 'string', format: 'date-time' },
            metadata: { type: 'object' }
          }
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'User ID' },
            username: { type: 'string', description: 'Username' },
            email: { type: 'string', format: 'email', description: 'Email address' },
            avatar: { type: 'string', description: 'Avatar URL' },
            isActive: { type: 'boolean', description: 'Active status' }
          }
        }
      }
    };

    const mergedOptions = { ...defaultOptions, ...options };
    this.spec = await this.generator.generateSpec(routesDir, mergedOptions);
    return this.spec;
  }

  getSwaggerMiddleware() {
    if (!this.spec) {
      throw new Error('Documentation not generated. Call generateDocumentation() first.');
    }

    return {
      serve: swaggerUi.serve,
      setup: swaggerUi.setup(this.spec, {
        explorer: true,
        customCss: `
          .swagger-ui .topbar { display: none }
          .swagger-ui .info .title { color: #3b82f6 }
          .swagger-ui .scheme-container { background: #f8fafc; padding: 10px; border-radius: 5px; }
        `,
        customSiteTitle: 'Auto-Generated API Documentation',
        swaggerOptions: {
          persistAuthorization: true,
          displayRequestDuration: true,
          filter: true,
          showExtensions: true,
          showCommonExtensions: true
        }
      })
    };
  }

  // Get the generated spec for other uses
  getSpec() {
    return this.spec;
  }

  // Regenerate documentation (useful for development)
  async regenerate(options = {}) {
    console.log('Regenerating API documentation...');
    await this.generateDocumentation(options);
    console.log('API documentation regenerated successfully');
    return this.spec;
  }
}

module.exports = AutoSwaggerConfig;