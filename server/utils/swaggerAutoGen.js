const fs = require('fs');
const path = require('path');
const express = require('express');

class SwaggerAutoGenerator {
  constructor() {
    this.routes = [];
    this.schemas = {};
  }

  // Extract routes from Express router
  extractRoutesFromRouter(router, basePath = '') {
    const routes = [];
    
    if (router.stack) {
      router.stack.forEach(layer => {
        if (layer.route) {
          // Direct route
          const route = layer.route;
          const methods = Object.keys(route.methods);
          
          methods.forEach(method => {
            routes.push({
              method: method.toUpperCase(),
              path: basePath + route.path,
              handler: route.stack[0].handle
            });
          });
        } else if (layer.name === 'router') {
          // Nested router
          const nestedPath = layer.regexp.source
            .replace(/\\\//g, '/')
            .replace(/\^\\\//g, '')
            .replace(/\$\?/g, '')
            .replace(/\\\//g, '/')
            .replace(/\(\?\:\[\\\/\]\)\?/g, '')
            .replace(/\\\//g, '/');
          
          const cleanPath = nestedPath.replace(/[^a-zA-Z0-9\/]/g, '');
          const subRoutes = this.extractRoutesFromRouter(layer.handle, basePath + '/' + cleanPath);
          routes.push(...subRoutes);
        }
      });
    }
    
    return routes;
  }

  // Analyze route handler to extract parameters and response types
  analyzeRouteHandler(handlerString) {
    const analysis = {
      parameters: [],
      requestBody: null,
      responses: {
        '200': { description: 'Success' },
        '500': { description: 'Internal Server Error' }
      }
    };

    // Extract query parameters
    const queryMatches = handlerString.match(/req\.query\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g);
    if (queryMatches) {
      queryMatches.forEach(match => {
        const paramName = match.replace('req.query.', '');
        if (!analysis.parameters.find(p => p.name === paramName)) {
          analysis.parameters.push({
            name: paramName,
            in: 'query',
            schema: { type: 'string' },
            description: `Query parameter: ${paramName}`
          });
        }
      });
    }

    // Extract path parameters
    const pathMatches = handlerString.match(/req\.params\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g);
    if (pathMatches) {
      pathMatches.forEach(match => {
        const paramName = match.replace('req.params.', '');
        if (!analysis.parameters.find(p => p.name === paramName)) {
          analysis.parameters.push({
            name: paramName,
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: `Path parameter: ${paramName}`
          });
        }
      });
    }

    // Extract request body usage
    if (handlerString.includes('req.body')) {
      analysis.requestBody = {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              description: 'Request body data'
            }
          }
        }
      };
    }

    // Extract status codes
    const statusMatches = handlerString.match(/res\.status\((\d+)\)/g);
    if (statusMatches) {
      statusMatches.forEach(match => {
        const status = match.match(/\d+/)[0];
        if (status !== '200') {
          analysis.responses[status] = {
            description: this.getStatusDescription(status)
          };
        }
      });
    }

    return analysis;
  }

  getStatusDescription(status) {
    const descriptions = {
      '201': 'Created successfully',
      '400': 'Bad request',
      '401': 'Unauthorized',
      '403': 'Forbidden',
      '404': 'Not found',
      '500': 'Internal server error'
    };
    return descriptions[status] || 'Unknown status';
  }

  // Generate tag name from path
  generateTagFromPath(path) {
    const segments = path.split('/').filter(s => s && !s.startsWith(':'));
    if (segments.length > 0) {
      return segments[segments.length - 1].charAt(0).toUpperCase() + 
             segments[segments.length - 1].slice(1);
    }
    return 'Default';
  }

  // Generate operation summary
  generateSummary(method, path) {
    const action = {
      'GET': 'Get',
      'POST': 'Create',
      'PUT': 'Update',
      'PATCH': 'Update',
      'DELETE': 'Delete'
    }[method] || 'Handle';

    const resource = this.generateTagFromPath(path).toLowerCase();
    
    if (path.includes('/:')) {
      return `${action} ${resource} by ID`;
    } else if (method === 'GET') {
      return `Get all ${resource}`;
    } else {
      return `${action} ${resource}`;
    }
  }

  // Scan route files and generate documentation
  async scanRoutes(routesDir) {
    const routeFiles = fs.readdirSync(routesDir)
      .filter(file => file.endsWith('.js') && file !== 'index.js');

    const paths = {};
    const tags = new Set();

    for (const file of routeFiles) {
      const routePath = path.join(routesDir, file);
      const routeContent = fs.readFileSync(routePath, 'utf8');
      
      // Extract router definition
      try {
        // Create a mock require function
        const mockRequire = (modulePath) => {
          if (modulePath.startsWith('../models/')) {
            return class MockModel {
              static find() { return { sort: () => ({ limit: () => [] }) }; }
              static findById() { return null; }
              static findByIdAndUpdate() { return null; }
              static findByIdAndDelete() { return null; }
              save() { return this; }
            };
          }
          if (modulePath === 'express') {
            return { Router: () => ({ get: () => {}, post: () => {}, put: () => {}, delete: () => {} }) };
          }
          return {};
        };

        // Extract route definitions using regex
        const routeMatches = routeContent.match(/router\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`)]+)['"`]\s*,\s*async?\s*\([^)]*\)\s*=>\s*\{[\s\S]*?\}\s*\)/g);
        
        if (routeMatches) {
          routeMatches.forEach(match => {
            const methodMatch = match.match(/router\.(get|post|put|patch|delete)/);
            const pathMatch = match.match(/['"`]([^'"`)]+)['"`]/);
            const handlerMatch = match.match(/\{[\s\S]*\}/);
            
            if (methodMatch && pathMatch && handlerMatch) {
              const method = methodMatch[1].toUpperCase();
              const routePath = pathMatch[1];
              const handler = handlerMatch[0];
              
              const fullPath = `/api/${file.replace('.js', '')}${routePath === '/' ? '' : routePath}`;
              const tag = this.generateTagFromPath(fullPath);
              tags.add(tag);
              
              const analysis = this.analyzeRouteHandler(handler);
              
              if (!paths[fullPath]) {
                paths[fullPath] = {};
              }
              
              paths[fullPath][method.toLowerCase()] = {
                summary: this.generateSummary(method, fullPath),
                description: `Auto-generated documentation for ${method} ${fullPath}`,
                tags: [tag],
                parameters: analysis.parameters,
                ...(analysis.requestBody && { requestBody: analysis.requestBody }),
                responses: analysis.responses
              };
            }
          });
        }
      } catch (error) {
        console.warn(`Could not parse route file ${file}:`, error.message);
      }
    }

    return {
      paths,
      tags: Array.from(tags).map(tag => ({
        name: tag,
        description: `${tag} management endpoints`
      }))
    };
  }

  // Generate complete OpenAPI specification
  async generateSpec(routesDir, options = {}) {
    const { paths, tags } = await this.scanRoutes(routesDir);
    
    return {
      openapi: '3.0.0',
      info: {
        title: options.title || 'Auto-Generated API Documentation',
        version: options.version || '1.0.0',
        description: options.description || 'Automatically generated API documentation from route analysis',
        ...options.info
      },
      servers: options.servers || [
        {
          url: 'http://localhost:5000',
          description: 'Development server'
        }
      ],
      tags,
      paths,
      components: {
        schemas: {
          Error: {
            type: 'object',
            properties: {
              error: {
                type: 'string',
                description: 'Error message'
              }
            }
          },
          ...options.schemas
        }
      }
    };
  }
}

module.exports = SwaggerAutoGenerator;