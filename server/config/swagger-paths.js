module.exports = {
  // Authentication paths
  '/api/auth/register': {
    post: {
      summary: 'Register a new user',
      description: 'Create a new user account',
      tags: ['Authentication'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UserInput' }
          }
        }
      },
      responses: {
        201: {
          description: 'User registered successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthResponse' }
            }
          }
        },
        400: {
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
      description: 'Authenticate user and return tokens',
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
        200: {
          description: 'Login successful',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthResponse' }
            }
          }
        },
        401: {
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
        200: {
          description: 'Token refreshed successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthResponse' }
            }
          }
        },
        401: {
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
        200: {
          description: 'Logout successful',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessMessage' }
            }
          }
        },
        401: {
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
        200: {
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
        401: {
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

  // User management paths
  '/api/users': {
    get: {
      summary: 'Get all users',
      description: 'Retrieve list of users (public with limited info, full info for admins)',
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'isActive',
          in: 'query',
          schema: {
            type: 'boolean',
            default: true
          },
          description: 'Filter by active status'
        }
      ],
      responses: {
        200: {
          description: 'List of users retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/User' }
              }
            }
          }
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    },
    post: {
      summary: 'Create new user',
      description: 'Create a new user (admin only)',
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UserInput' }
          }
        }
      },
      responses: {
        201: {
          description: 'User created successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/User' }
            }
          }
        },
        400: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        401: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        403: {
          description: 'Admin access required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },

  '/api/users/{id}': {
    get: {
      summary: 'Get user by ID',
      description: 'Retrieve specific user information (self or admin)',
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'User ID'
        }
      ],
      responses: {
        200: {
          description: 'User retrieved successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/User' }
            }
          }
        },
        401: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        403: {
          description: 'Access denied',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        404: {
          description: 'User not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    },
    put: {
      summary: 'Update user',
      description: 'Update user information (self or admin)',
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'User ID'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UserUpdate' }
          }
        }
      },
      responses: {
        200: {
          description: 'User updated successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/User' }
            }
          }
        },
        400: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        401: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        403: {
          description: 'Access denied',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        404: {
          description: 'User not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    },
    delete: {
      summary: 'Delete user',
      description: 'Deactivate user account (admin only)',
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'User ID'
        }
      ],
      responses: {
        200: {
          description: 'User deactivated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'User deactivated successfully'
                  },
                  user: { $ref: '#/components/schemas/User' }
                }
              }
            }
          }
        },
        401: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        403: {
          description: 'Admin access required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        404: {
          description: 'User not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },

  // Message paths
  '/api/messages': {
    get: {
      summary: 'Get all messages',
      description: 'Retrieve messages with optional filtering and pagination',
      tags: ['Messages'],
      parameters: [
        {
          name: 'limit',
          in: 'query',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 50
          },
          description: 'Maximum number of messages to return'
        },
        {
          name: 'messageType',
          in: 'query',
          schema: {
            type: 'string',
            enum: ['user', 'bot']
          },
          description: 'Filter messages by type'
        }
      ],
      responses: {
        200: {
          description: 'List of messages retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Message' }
              }
            }
          }
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    },
    post: {
      summary: 'Create a new message',
      description: 'Send a new message to the chat',
      tags: ['Messages'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/MessageInput' }
          }
        }
      },
      responses: {
        201: {
          description: 'Message created successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Message' }
            }
          }
        },
        400: {
          description: 'Bad request - validation error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },

  '/api/messages/{id}': {
    get: {
      summary: 'Get message by ID',
      description: 'Retrieve a specific message by its ID',
      tags: ['Messages'],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'Message ID'
        }
      ],
      responses: {
        200: {
          description: 'Message retrieved successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Message' }
            }
          }
        },
        404: {
          description: 'Message not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    },
    delete: {
      summary: 'Delete message by ID',
      description: 'Delete a specific message by its ID',
      tags: ['Messages'],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'Message ID'
        }
      ],
      responses: {
        200: {
          description: 'Message deleted successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessMessage' }
            }
          }
        },
        404: {
          description: 'Message not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },
  // Add these paths to the existing swagger-paths.js file
  
  '/api/auth/change-password': {
    post: {
      summary: 'Change user password',
      description: 'Change authenticated user password',
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
        200: {
          description: 'Password changed successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessMessage' }
            }
          }
        },
        400: {
          description: 'Invalid current password or validation error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        401: {
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
  '/api/users/admin/stats': {
    get: {
      summary: 'Get user statistics',
      description: 'Get comprehensive user statistics (admin only)',
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'User statistics retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  totalUsers: {
                    type: 'number',
                    description: 'Total number of users'
                  },
                  activeUsers: {
                    type: 'number',
                    description: 'Number of active users'
                  },
                  inactiveUsers: {
                    type: 'number',
                    description: 'Number of inactive users'
                  },
                  adminUsers: {
                    type: 'number',
                    description: 'Number of admin users'
                  },
                  recentRegistrations: {
                    type: 'number',
                    description: 'Users registered in last 30 days'
                  }
                }
              }
            }
          }
        },
        401: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        403: {
          description: 'Admin access required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },
  '/api/messages/search/{term}': {
    get: {
      summary: 'Search messages',
      description: 'Search messages by content',
      tags: ['Messages'],
      parameters: [
        {
          name: 'term',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'Search term'
        }
      ],
      responses: {
        200: {
          description: 'Messages found',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Message' }
              }
            }
          }
        },
        404: {
          description: 'No messages found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },
  '/api/messages/sender/{sender}': {
    get: {
      summary: 'Get messages by sender',
      description: 'Retrieve all messages from a specific sender',
      tags: ['Messages'],
      parameters: [
        {
          name: 'sender',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'Sender name'
        }
      ],
      responses: {
        200: {
          description: 'Messages retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Message' }
              }
            }
          }
        },
        404: {
          description: 'No messages found for sender',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },
  '/api/messages/admin/stats': {
    get: {
      summary: 'Get message statistics',
      description: 'Get comprehensive message statistics',
      tags: ['Messages'],
      responses: {
        200: {
          description: 'Message statistics retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  totalMessages: {
                    type: 'number',
                    description: 'Total number of messages'
                  },
                  userMessages: {
                    type: 'number',
                    description: 'Number of user messages'
                  },
                  botMessages: {
                    type: 'number',
                    description: 'Number of bot messages'
                  },
                  averageMessageLength: {
                    type: 'number',
                    description: 'Average message content length'
                  },
                  messagesPerDay: {
                    type: 'number',
                    description: 'Average messages per day'
                  },
                  topSenders: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        sender: { type: 'string' },
                        count: { type: 'number' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};