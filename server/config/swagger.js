const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
const SwaggerRouteGenerator = require('./swaggerRouteGenerator');
const AutoSwaggerConfig = require('./swaggerAuto');

// Import centralized configurations
const swaggerSchemas = require('./swagger-schemas');
const swaggerPaths = require('./swagger-paths');

// Get environment from NODE_ENV or default to 'local'
const environment = process.env.NODE_ENV || 'local';

// Environment-specific configurations
const environmentConfigs = {
  local: {
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Local development server'
      }
    ],
    enabled: true,
    showTryItOut: true,
    showSchemas: true,
    docExpansion: 'list',
    filter: true,
    deepLinking: true,
    autoGenerate: true,
    routeGeneration: true
  },
  development: {
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Development server'
      }
    ],
    enabled: true,
    showTryItOut: true,
    showSchemas: true,
    docExpansion: 'list',
    filter: true,
    deepLinking: true,
    autoGenerate: true,
    routeGeneration: true
  },
  staging: {
    servers: [
      {
        url: process.env.STAGING_URL || 'https://staging-api.chatboxrag.com',
        description: 'Staging server'
      }
    ],
    enabled: true,
    showTryItOut: true,
    showSchemas: false,
    docExpansion: 'none',
    filter: false,
    deepLinking: false,
    autoGenerate: false,
    routeGeneration: false
  },
  production: {
    servers: [
      {
        url: process.env.PRODUCTION_URL || 'https://api.chatboxrag.com',
        description: 'Production server'
      }
    ],
    enabled: process.env.SWAGGER_ENABLED === 'true' || false,
    showTryItOut: false,
    showSchemas: false,
    docExpansion: 'none',
    filter: false,
    deepLinking: false,
    autoGenerate: false,
    routeGeneration: false
  }
};

// Get current environment config
const currentConfig = environmentConfigs[environment] || environmentConfigs.local;

// Initialize route generator
const routeGenerator = new SwaggerRouteGenerator({
  autoGenerate: currentConfig.autoGenerate
});

// Initialize auto swagger config
const autoSwagger = new AutoSwaggerConfig();

// Base Swagger specification
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Chatbox RAG API',
    version: '1.0.0',
    description: 'A comprehensive API for Chatbox RAG application with MongoDB integration',
    contact: {
      name: 'API Support',
      email: 'support@chatboxrag.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: currentConfig.servers,
  paths: swaggerPaths,
  components: {
    schemas: swaggerSchemas,
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token'
      }
    }
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and authorization endpoints'
    },
    {
      name: 'Users',
      description: 'User management endpoints'
    },
    {
      name: 'Messages',
      description: 'Message management endpoints'
    },
    {
      name: 'General',
      description: 'General API endpoints'
    }
  ]
};

// Add environment-specific security schemes
if (environment === 'production') {
  swaggerDefinition.components.securitySchemes = {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Enter JWT token (Production environment)'
    }
  };
}

// Custom CSS for Swagger UI
const getCustomCss = () => {
  const baseStyles = `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info .title { color: #3b82f6; }
    .swagger-ui .scheme-container { background: #f8fafc; padding: 10px; border-radius: 5px; }
  `;
  
  const environmentStyles = {
    local: '.swagger-ui .info .title:after { content: " (LOCAL)"; color: #10b981; }',
    development: '.swagger-ui .info .title:after { content: " (DEV)"; color: #f59e0b; }',
    staging: '.swagger-ui .info .title:after { content: " (STAGING)"; color: #ef4444; }',
    production: '.swagger-ui .info .title:after { content: " (PROD)"; color: #dc2626; }'
  };
  
  return baseStyles + (environmentStyles[environment] || '');
};

// Swagger UI options based on environment
const swaggerOptions = {
  customCss: getCustomCss(),
  customSiteTitle: `Chatbox RAG API Documentation - ${environment.toUpperCase()}`,
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    docExpansion: currentConfig.docExpansion,
    filter: currentConfig.filter,
    showRequestHeaders: true,
    showCommonExtensions: currentConfig.showSchemas,
    tryItOutEnabled: currentConfig.showTryItOut,
    requestInterceptor: (req) => {
      // Add environment header for tracking
      req.headers['X-API-Environment'] = environment;
      return req;
    }
  }
};

// Middleware to check if Swagger should be enabled
const swaggerMiddleware = (req, res, next) => {
  if (!currentConfig.enabled) {
    return res.status(404).json({
      error: 'API documentation is not available in this environment',
      environment: environment
    });
  }
  next();
};

// Initialize route generation if enabled
if (currentConfig.routeGeneration) {
  routeGenerator.initialize().catch(console.error);
}

// Update the module.exports section
module.exports = {
  // Main exports
  swaggerSpec: swaggerDefinition,
  swaggerDocument: swaggerDefinition,
  swaggerUi,
  swaggerOptions,
  swaggerMiddleware,
  
  // Configuration
  environment,
  currentConfig,
  isEnabled: currentConfig.enabled, // Add this alias
  
  // Utilities
  routeGenerator,
  autoSwagger,
  
  // Helper functions
  async regenerateRoutes() {
    if (currentConfig.routeGeneration) {
      return await routeGenerator.autoGenerateFromSwagger();
    }
    throw new Error('Route generation is disabled in this environment');
  },
  
  async cleanGeneratedRoutes() {
    return await routeGenerator.cleanGeneratedRoutes();
  },
  
  async generateAutoDocumentation() {
    if (currentConfig.autoGenerate) {
      return await autoSwagger.generateDocumentation();
    }
    throw new Error('Auto-generation is disabled in this environment');
  },
  
  // Dynamic configuration updates
  updateEnvironmentConfig(newConfig) {
    Object.assign(currentConfig, newConfig);
    return currentConfig;
  },
  
  // Get current configuration
  getConfig() {
    return {
      environment,
      config: currentConfig,
      servers: swaggerDefinition.servers
    };
  }
};