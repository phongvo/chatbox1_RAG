const swaggerUi = require('swagger-ui-express');

// Complete Swagger document with Authentication APIs
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Chatbox RAG API',
    version: '1.0.0',
    description: 'Complete API documentation with authentication'
  },
  servers: [
    {
      url: 'http://localhost:5050',
      description: 'Development server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          username: { type: 'string', example: 'johndoe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
          username: { type: 'string', minLength: 3, example: 'johndoe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          password: { type: 'string', minLength: 6, example: 'password123' },
          role: { type: 'string', enum: ['user', 'admin'], default: 'user' }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          password: { type: 'string', example: 'password123' }
        }
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Login successful' },
          user: { $ref: '#/components/schemas/User' },
          accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
        }
      },
      RefreshTokenRequest: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
        }
      },
      ChangePasswordRequest: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: { type: 'string', example: 'oldpassword123' },
          newPassword: { type: 'string', minLength: 6, example: 'newpassword123' }
        }
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Error message' },
          error: { type: 'string', example: 'Detailed error information' }
        }
      }
    }
  },
  paths: {
    '/api/auth/register': {
      post: {
        summary: 'Register a new user',
        description: 'Create a new user account',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' }
            }
          }
        },
        responses: {
          '201': {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' }
              }
            }
          },
          '400': {
            description: 'Validation error or user already exists',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/api/auth/login': {
      post: {
        summary: 'Login user',
        description: 'Authenticate user and return JWT tokens',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' }
              }
            }
          },
          '401': {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/api/auth/refresh': {
      post: {
        summary: 'Refresh access token',
        description: 'Get new access token using refresh token',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RefreshTokenRequest' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Token refreshed successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' }
              }
            }
          },
          '401': {
            description: 'Invalid refresh token',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/api/auth/logout': {
      post: {
        summary: 'Logout user',
        description: 'Invalidate refresh tokens',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  refreshToken: {
                    type: 'string',
                    description: 'Specific refresh token to invalidate (optional)'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Logout successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Logout successful' }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Authentication required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/api/auth/me': {
      get: {
        summary: 'Get current user profile',
        description: 'Retrieve authenticated user information',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'User profile retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Authentication required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/api/auth/change-password': {
      post: {
        summary: 'Change user password',
        description: 'Change the current user password',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ChangePasswordRequest' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Password changed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Password changed successfully' }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Invalid current password',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          },
          '401': {
            description: 'Authentication required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/api/health': {
      get: {
        summary: 'Health check',
        description: 'Check if the server is running',
        tags: ['System'],
        responses: {
          '200': {
            description: 'Server is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'healthy' },
                    timestamp: { type: 'string', format: 'date-time' },
                    port: { type: 'number', example: 5050 }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and authorization endpoints'
    },
    {
      name: 'System',
      description: 'System health and status endpoints'
    }
  ]
};

module.exports = {
  swaggerDocument,
  swaggerUi,
  isEnabled: true
};