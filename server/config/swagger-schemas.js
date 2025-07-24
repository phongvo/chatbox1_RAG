module.exports = {
  // User schemas
  User: {
    type: 'object',
    required: ['username', 'email'],
    properties: {
      _id: {
        type: 'string',
        description: 'Auto-generated MongoDB ObjectId',
        example: '507f1f77bcf86cd799439011'
      },
      username: {
        type: 'string',
        minLength: 3,
        maxLength: 30,
        description: 'Unique username',
        example: 'johndoe'
      },
      email: {
        type: 'string',
        format: 'email',
        description: 'User email address',
        example: 'john@example.com'
      },
      password: {
        type: 'string',
        minLength: 6,
        description: 'User password (write-only)',
        writeOnly: true
      },
      role: {
        type: 'string',
        enum: ['user', 'admin'],
        default: 'user',
        description: 'User role'
      },
      avatar: {
        type: 'string',
        description: 'User avatar URL',
        example: 'https://example.com/avatar.jpg'
      },
      isActive: {
        type: 'boolean',
        default: true,
        description: 'User active status'
      },
      lastLogin: {
        type: 'string',
        format: 'date-time',
        description: 'Last login timestamp'
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: 'Creation timestamp'
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        description: 'Last update timestamp'
      }
    }
  },

  UserInput: {
    type: 'object',
    required: ['username', 'email', 'password'],
    properties: {
      username: { $ref: '#/components/schemas/User/properties/username' },
      email: { $ref: '#/components/schemas/User/properties/email' },
      password: { $ref: '#/components/schemas/User/properties/password' },
      role: { $ref: '#/components/schemas/User/properties/role' },
      avatar: { $ref: '#/components/schemas/User/properties/avatar' }
    }
  },

  UserUpdate: {
    type: 'object',
    properties: {
      username: { $ref: '#/components/schemas/User/properties/username' },
      email: { $ref: '#/components/schemas/User/properties/email' },
      avatar: { $ref: '#/components/schemas/User/properties/avatar' },
      role: { $ref: '#/components/schemas/User/properties/role' }
    }
  },

  // Message schemas
  Message: {
    type: 'object',
    required: ['content', 'sender'],
    properties: {
      _id: {
        type: 'string',
        description: 'Auto-generated MongoDB ObjectId',
        example: '507f1f77bcf86cd799439011'
      },
      content: {
        type: 'string',
        description: 'Message content',
        example: 'Hello, how are you?'
      },
      sender: {
        type: 'string',
        description: 'Message sender name',
        example: 'John Doe'
      },
      messageType: {
        type: 'string',
        enum: ['user', 'bot'],
        default: 'user',
        description: 'Type of message'
      },
      timestamp: {
        type: 'string',
        format: 'date-time',
        description: 'Message timestamp'
      },
      metadata: {
        type: 'object',
        description: 'Additional message metadata'
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: 'Creation timestamp'
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        description: 'Last update timestamp'
      }
    }
  },

  MessageInput: {
    type: 'object',
    required: ['content', 'sender'],
    properties: {
      content: { $ref: '#/components/schemas/Message/properties/content' },
      sender: { $ref: '#/components/schemas/Message/properties/sender' },
      messageType: { $ref: '#/components/schemas/Message/properties/messageType' },
      metadata: { $ref: '#/components/schemas/Message/properties/metadata' }
    }
  },

  // Authentication schemas
  LoginRequest: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        description: 'User email address',
        example: 'john@example.com'
      },
      password: {
        type: 'string',
        description: 'User password',
        example: 'password123'
      }
    }
  },

  AuthResponse: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        example: 'Login successful'
      },
      accessToken: {
        type: 'string',
        description: 'JWT access token'
      },
      refreshToken: {
        type: 'string',
        description: 'JWT refresh token'
      },
      user: {
        $ref: '#/components/schemas/User'
      }
    }
  },

  RefreshTokenRequest: {
    type: 'object',
    required: ['refreshToken'],
    properties: {
      refreshToken: {
        type: 'string',
        description: 'JWT refresh token'
      }
    }
  },

  // Common schemas
  Error: {
    type: 'object',
    properties: {
      error: {
        type: 'string',
        description: 'Error message'
      },
      message: {
        type: 'string',
        description: 'Detailed error description'
      }
    }
  },

  SuccessMessage: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        description: 'Success message'
      }
    }
  },

  // Add to the end of the existing schemas

    ChangePasswordRequest: {
      type: 'object',
      required: ['currentPassword', 'newPassword'],
      properties: {
        currentPassword: {
          type: 'string',
          description: 'Current password'
        },
        newPassword: {
          type: 'string',
          minLength: 6,
          description: 'New password'
        }
      }
    },
  
    UserStats: {
      type: 'object',
      properties: {
        totalUsers: { type: 'number' },
        activeUsers: { type: 'number' },
        inactiveUsers: { type: 'number' },
        adminUsers: { type: 'number' },
        recentRegistrations: { type: 'number' }
      }
    },
  
    MessageStats: {
      type: 'object',
      properties: {
        totalMessages: { type: 'number' },
        userMessages: { type: 'number' },
        botMessages: { type: 'number' },
        averageMessageLength: { type: 'number' },
        messagesPerDay: { type: 'number' },
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
};