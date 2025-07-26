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
        description: 'User password',
        example: 'password123'
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
      }
    }
  },

  UserUpdate: {
    type: 'object',
    properties: {
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
      avatar: {
        type: 'string',
        description: 'User avatar URL',
        example: 'https://example.com/avatar.jpg'
      },
      role: {
        type: 'string',
        enum: ['user', 'admin'],
        description: 'User role'
      }
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
        description: 'Additional message metadata',
        additionalProperties: true
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
      metadata: {
        type: 'object',
        description: 'Additional message metadata',
        additionalProperties: true
      }
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
        description: 'JWT access token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      },
      refreshToken: {
        type: 'string',
        description: 'JWT refresh token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      },
      user: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          username: {
            type: 'string',
            example: 'johndoe'
          },
          email: {
            type: 'string',
            example: 'john@example.com'
          },
          role: {
            type: 'string',
            example: 'user'
          }
        }
      }
    }
  },

  RefreshTokenRequest: {
    type: 'object',
    required: ['refreshToken'],
    properties: {
      refreshToken: {
        type: 'string',
        description: 'JWT refresh token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
    }
  },

  ChangePasswordRequest: {
    type: 'object',
    required: ['currentPassword', 'newPassword'],
    properties: {
      currentPassword: {
        type: 'string',
        description: 'Current password',
        example: 'oldpassword123'
      },
      newPassword: {
        type: 'string',
        minLength: 6,
        description: 'New password (minimum 6 characters)',
        example: 'newpassword123'
      }
    }
  },

  // Common schemas
  Error: {
    type: 'object',
    required: ['error'],
    properties: {
      error: {
        type: 'string',
        description: 'Error message',
        example: 'Something went wrong'
      },
      message: {
        type: 'string',
        description: 'Detailed error description',
        example: 'The requested resource was not found'
      },
      code: {
        type: 'string',
        description: 'Error code',
        example: 'RESOURCE_NOT_FOUND'
      }
    }
  },

  SuccessMessage: {
    type: 'object',
    required: ['message'],
    properties: {
      message: {
        type: 'string',
        description: 'Success message',
        example: 'Operation completed successfully'
      },
      timestamp: {
        type: 'string',
        format: 'date-time',
        description: 'Timestamp of the operation'
      }
    }
  },
  
  UserStats: {
    type: 'object',
    properties: {
      totalUsers: {
        type: 'number',
        description: 'Total number of users',
        example: 150
      },
      activeUsers: {
        type: 'number',
        description: 'Number of active users',
        example: 120
      },
      inactiveUsers: {
        type: 'number',
        description: 'Number of inactive users',
        example: 30
      },
      adminUsers: {
        type: 'number',
        description: 'Number of admin users',
        example: 5
      },
      recentRegistrations: {
        type: 'number',
        description: 'Users registered in last 30 days',
        example: 25
      }
    }
  },
  
  MessageStats: {
    type: 'object',
    properties: {
      totalMessages: {
        type: 'number',
        description: 'Total number of messages',
        example: 1500
      },
      userMessages: {
        type: 'number',
        description: 'Number of user messages',
        example: 800
      },
      botMessages: {
        type: 'number',
        description: 'Number of bot messages',
        example: 700
      },
      todayMessages: {
        type: 'number',
        description: 'Messages sent today',
        example: 45
      },
      averageLength: {
        type: 'number',
        description: 'Average message length',
        example: 125.5
      }
    }
  }
};