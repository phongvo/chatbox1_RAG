const fs = require('fs');
const path = require('path');
const express = require('express');
const SwaggerAutoGenerator = require('../utils/swaggerAutoGen');

class SwaggerRouteGenerator {
  constructor(options = {}) {
    this.generator = new SwaggerAutoGenerator();
    this.routesDir = options.routesDir || path.join(__dirname, '../routes');
    this.generatedDir = options.generatedDir || path.join(__dirname, '../routes/generated');
    this.swaggerFile = options.swaggerFile || path.join(__dirname, 'swagger.json');
    this.autoGenerate = options.autoGenerate !== false;
    this.environment = process.env.NODE_ENV || 'local';
    
    // Ensure generated directory exists
    if (!fs.existsSync(this.generatedDir)) {
      fs.mkdirSync(this.generatedDir, { recursive: true });
    }
  }

  // Generate routes from Swagger specification
  async generateRoutesFromSwagger(swaggerSpec) {
    const generatedRoutes = {};
    
    if (!swaggerSpec.paths) {
      throw new Error('No paths found in Swagger specification');
    }

    for (const [pathKey, pathItem] of Object.entries(swaggerSpec.paths)) {
      for (const [method, operation] of Object.entries(pathItem)) {
        if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
          const routeInfo = this.generateRouteHandler(pathKey, method, operation);
          
          // Group by resource
          const resource = this.extractResourceFromPath(pathKey);
          if (!generatedRoutes[resource]) {
            generatedRoutes[resource] = {
              routes: [],
              imports: new Set(),
              middleware: new Set()
            };
          }
          
          generatedRoutes[resource].routes.push(routeInfo);
          
          // Add required imports based on operation
          if (operation.requestBody) {
            generatedRoutes[resource].middleware.add('validation');
          }
          if (operation.security) {
            generatedRoutes[resource].middleware.add('auth');
          }
        }
      }
    }

    // Generate route files
    for (const [resource, data] of Object.entries(generatedRoutes)) {
      await this.writeRouteFile(resource, data);
    }

    return generatedRoutes;
  }

  // Extract resource name from path
  extractResourceFromPath(path) {
    const segments = path.split('/').filter(s => s && !s.startsWith('{') && !s.startsWith(':'));
    return segments[segments.length - 1] || 'default';
  }

  // Generate route handler code
  generateRouteHandler(path, method, operation) {
    const handlerName = this.generateHandlerName(path, method);
    const pathParams = this.extractPathParameters(path);
    const queryParams = this.extractQueryParameters(operation);
    const hasRequestBody = !!operation.requestBody;
    
    let handlerCode = `
// ${operation.summary || `${method.toUpperCase()} ${path}`}
// ${operation.description || 'Auto-generated route handler'}
router.${method}('${this.convertSwaggerPathToExpress(path)}', async (req, res) => {
  try {`;

    // Add parameter validation
    if (pathParams.length > 0) {
      handlerCode += `
    // Path parameters: ${pathParams.join(', ')}`;
      pathParams.forEach(param => {
        handlerCode += `
    const ${param} = req.params.${param};`;
      });
    }

    if (queryParams.length > 0) {
      handlerCode += `
    // Query parameters: ${queryParams.join(', ')}`;
      queryParams.forEach(param => {
        handlerCode += `
    const ${param} = req.query.${param};`;
      });
    }

    if (hasRequestBody) {
      handlerCode += `
    // Request body
    const data = req.body;`;
    }

    // Add basic implementation based on method
    handlerCode += this.generateMethodImplementation(method, operation);

    handlerCode += `
  } catch (error) {
    console.error('Error in ${handlerName}:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});`;

    return {
      method,
      path,
      handlerName,
      code: handlerCode,
      operation
    };
  }

  // Generate method-specific implementation
  generateMethodImplementation(method, operation) {
    const responses = operation.responses || {};
    const successStatus = Object.keys(responses).find(status => status.startsWith('2')) || '200';
    
    switch (method) {
      case 'get':
        if (operation.parameters?.some(p => p.in === 'path')) {
          return `
    // TODO: Implement get by ID logic
    // const result = await Model.findById(id);
    // if (!result) {
    //   return res.status(404).json({ error: 'Resource not found' });
    // }
    res.status(${successStatus}).json({ message: 'Get by ID - Implementation needed', data: {} });`;
        } else {
          return `
    // TODO: Implement get all logic
    // const results = await Model.find();
    res.status(${successStatus}).json({ message: 'Get all - Implementation needed', data: [] });`;
        }
      
      case 'post':
        return `
    // TODO: Implement create logic
    // const newResource = new Model(data);
    // const saved = await newResource.save();
    res.status(${successStatus}).json({ message: 'Create - Implementation needed', data: data });`;
      
      case 'put':
      case 'patch':
        return `
    // TODO: Implement update logic
    // const updated = await Model.findByIdAndUpdate(id, data, { new: true });
    // if (!updated) {
    //   return res.status(404).json({ error: 'Resource not found' });
    // }
    res.status(${successStatus}).json({ message: 'Update - Implementation needed', data: data });`;
      
      case 'delete':
        return `
    // TODO: Implement delete logic
    // const deleted = await Model.findByIdAndDelete(id);
    // if (!deleted) {
    //   return res.status(404).json({ error: 'Resource not found' });
    // }
    res.status(${successStatus}).json({ message: 'Delete - Implementation needed' });`;
      
      default:
        return `
    res.status(${successStatus}).json({ message: 'Method implementation needed' });`;
    }
  }

  // Convert Swagger path format to Express format
  convertSwaggerPathToExpress(swaggerPath) {
    return swaggerPath.replace(/{([^}]+)}/g, ':$1');
  }

  // Extract path parameters
  extractPathParameters(path) {
    const matches = path.match(/{([^}]+)}/g);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  }

  // Extract query parameters from operation
  extractQueryParameters(operation) {
    if (!operation.parameters) return [];
    return operation.parameters
      .filter(param => param.in === 'query')
      .map(param => param.name);
  }

  // Generate handler function name
  generateHandlerName(path, method) {
    const resource = this.extractResourceFromPath(path);
    const action = method;
    const hasId = path.includes('{') || path.includes(':');
    return `${action}${resource.charAt(0).toUpperCase() + resource.slice(1)}${hasId ? 'ById' : ''}`;
  }

  // Write route file
  async writeRouteFile(resource, data) {
    const fileName = `${resource}.generated.js`;
    const filePath = path.join(this.generatedDir, fileName);
    
    let fileContent = `// Auto-generated route file for ${resource}
// Generated on: ${new Date().toISOString()}
// Environment: ${this.environment}

const express = require('express');
const router = express.Router();

// TODO: Import your models
// const ${resource.charAt(0).toUpperCase() + resource.slice(1)} = require('../models/${resource.charAt(0).toUpperCase() + resource.slice(1)}');

// TODO: Import middleware if needed
`;

    if (data.middleware.has('validation')) {
      fileContent += `// const { validateRequest } = require('../middleware/validation');
`;
    }
    
    if (data.middleware.has('auth')) {
      fileContent += `// const { authenticate } = require('../middleware/auth');
`;
    }

    fileContent += `
// Routes
`;
    
    data.routes.forEach(route => {
      fileContent += route.code + '\n';
    });

    fileContent += `
module.exports = router;
`;

    fs.writeFileSync(filePath, fileContent);
    console.log(`✅ Generated route file: ${fileName}`);
    
    return filePath;
  }

  // Auto-generate routes from existing Swagger file
  async autoGenerateFromSwagger() {
    if (!this.autoGenerate) {
      console.log('Auto-generation disabled');
      return;
    }

    try {
      if (fs.existsSync(this.swaggerFile)) {
        const swaggerContent = fs.readFileSync(this.swaggerFile, 'utf8');
        const swaggerSpec = JSON.parse(swaggerContent);
        
        console.log('🔄 Auto-generating routes from Swagger specification...');
        const generatedRoutes = await this.generateRoutesFromSwagger(swaggerSpec);
        
        console.log(`✅ Generated ${Object.keys(generatedRoutes).length} route files`);
        return generatedRoutes;
      } else {
        console.log('⚠️ Swagger file not found, skipping auto-generation');
      }
    } catch (error) {
      console.error('❌ Error during auto-generation:', error.message);
    }
  }

  // Generate index file for generated routes
  async generateRoutesIndex() {
    const generatedFiles = fs.readdirSync(this.generatedDir)
      .filter(file => file.endsWith('.generated.js'))
      .map(file => file.replace('.generated.js', ''));

    if (generatedFiles.length === 0) {
      return;
    }

    const indexContent = `// Auto-generated routes index
// Generated on: ${new Date().toISOString()}

const express = require('express');
const router = express.Router();

// Import generated route modules
${generatedFiles.map(file => 
  `const ${file}Routes = require('./${file}.generated');`
).join('\n')}

// Mount generated routes
${generatedFiles.map(file => 
  `router.use('/${file}', ${file}Routes);`
).join('\n')}

// List all available generated endpoints
router.get('/', (req, res) => {
  res.json({
    message: 'Auto-generated API endpoints',
    endpoints: {
${generatedFiles.map(file => 
  `      ${file}: '/api/generated/${file}'`
).join(',\n')}
    },
    generatedAt: '${new Date().toISOString()}'
  });
});

module.exports = router;
`;

    const indexPath = path.join(this.generatedDir, 'index.js');
    fs.writeFileSync(indexPath, indexContent);
    console.log('✅ Generated routes index file');
    
    return indexPath;
  }

  // Clean generated files
  async cleanGenerated() {
    if (fs.existsSync(this.generatedDir)) {
      const files = fs.readdirSync(this.generatedDir);
      files.forEach(file => {
        if (file.endsWith('.generated.js') || file === 'index.js') {
          fs.unlinkSync(path.join(this.generatedDir, file));
        }
      });
      console.log('🧹 Cleaned generated route files');
    }
  }

  // Initialize the generator
  async initialize() {
    console.log('🚀 Initializing Swagger Route Generator...');
    
    // Auto-generate if enabled
    await this.autoGenerateFromSwagger();
    
    // Generate index file
    await this.generateRoutesIndex();
    
    console.log('✅ Swagger Route Generator initialized');
  }
}

module.exports = SwaggerRouteGenerator;