# Chatbox RAG - AI-Powered Chat Application

A full-stack chat application with Retrieval-Augmented Generation (RAG) capabilities, powered by React, Node.js, MongoDB, and LMStudio with Mistral models.

## 🏗️ Architecture

### System Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │   Node.js API   │    │    MongoDB      │
│                 │    │                 │    │                 │
│ • Chat UI       │◄──►│ • REST API      │◄──►│ • Users         │
│ • File Upload   │    │ • Authentication│    │ • Messages      │
│ • Embeddings    │    │ • RAG Service   │    │ • Embeddings    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │    LMStudio     │
                       │                 │
                       │ • Mistral LLM   │
                       │ • Embeddings    │
                       │ • Local AI      │
                       └─────────────────┘
```

### Core Components

#### Frontend (React + Tailwind CSS)
- **Authentication**: JWT-based login/logout system
- **Chat Interface**: Real-time messaging with typing indicators
- **File Upload**: Support for PDF, TXT, DOCX, JSON files
- **Embedding Management**: Upload and search document embeddings
- **RAG Integration**: Context-aware responses using retrieved documents

#### Backend (Node.js + Express)
- **API Routes**: RESTful endpoints for chat, auth, and embeddings
- **Authentication**: JWT middleware with bcrypt password hashing
- **File Processing**: Multi-format document parsing (PDF, DOCX, TXT, JSON)
- **RAG Service**: Document chunking, embedding generation, similarity search
- **LMStudio Integration**: Local AI model management

#### Database (MongoDB)
- **Users**: Authentication and profile data
- **Messages**: Chat history and conversations
- **Embeddings**: Vector storage with metadata for RAG

#### AI Layer (LMStudio + Mistral)
- **Chat Models**: Mistral-7B-Instruct, Mixtral-8x7B, Mixtral-8x22B
- **Embedding Models**: Nomic-embed-text-v1.5, all-MiniLM-L6-v2
- **RAG Pipeline**: Context retrieval and response generation

## 🔄 Workflow

### 1. User Authentication Flow
```
User Login → JWT Token → Protected Routes → Dashboard Access
```

### 2. Chat Workflow
```
User Message → RAG Search (Optional) → Context Retrieval → 
LLM Processing → Response Generation → UI Update
```

### 3. Document Upload & Embedding Flow
```
File Upload → Text Extraction → Content Chunking → 
Embedding Generation → Vector Storage → Search Index
```

### 4. RAG Response Generation
```
Query → Embedding Generation → Similarity Search → 
Context Assembly → Prompt Engineering → LLM Response
```

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **Yarn** package manager
- **LMStudio** (for local AI models)

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd Chatbox_RAG_RNM
```

### Step 2: Install Dependencies
```bash
# Install all dependencies (root, server, client)
yarn install:all
```

### Step 3: Database Setup
```bash
# Start MongoDB service
brew services start mongodb/brew/mongodb-community

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Step 4: Environment Configuration
Create `.env` file in the `server` directory:
```bash
cp server/.env.example server/.env
```

Update the environment variables:
```env
# Server Configuration
PORT=5050
NODE_ENV=local

# MongoDB
MONGODB_URI=mongodb://localhost:27017/chatbox_rag

# JWT Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# LMStudio Configuration
LLSTUDIO_API_KEY=lm-studio
LLSTUDIO_BASE_URL=http://localhost:1234/v1

# AI Models
LLSTUDIO_EMBEDDING_MODEL=nomic-ai/nomic-embed-text-v1.5-GGUF
LLSTUDIO_CHAT_MODEL=mistralai/Mistral-7B-Instruct-v0.3-GGUF
```

### Step 5: LMStudio Setup
1. **Download LMStudio**: Visit [lmstudio.ai](https://lmstudio.ai)
2. **Install Models**:
   - Chat: `mistralai/Mistral-7B-Instruct-v0.3-GGUF`
   - Embedding: `nomic-ai/nomic-embed-text-v1.5-GGUF`
3. **Start Local Server**: Enable API server on port 1234

### Step 6: Run Application

#### Development Mode
```bash
# Start both server and client in development mode
yarn dev

# Or start individually
yarn dev:server  # Server on http://localhost:5050
yarn dev:client  # Client on http://localhost:3000
```

#### Production Mode
```bash
# Build client
yarn build

# Start production server
yarn start
```

## 📋 Available Scripts

### Root Level
- `yarn install:all` - Install all dependencies
- `yarn dev` - Start development servers
- `yarn start` - Start production servers
- `yarn test` - Run server tests
- `yarn build` - Build client for production
- `yarn clean` - Clean all node_modules

### Server Scripts
- `yarn dev` - Development with nodemon
- `yarn start` - Production server
- `yarn test` - Jest test suite
- `yarn test:watch` - Watch mode testing
- `yarn test:coverage` - Coverage reports

### Client Scripts
- `yarn start` - Development server
- `yarn build` - Production build
- `yarn test` - React testing

## 🔧 Configuration

### Supported File Types
- **PDF**: `.pdf` files using pdf-parse
- **Text**: `.txt` files with UTF-8 encoding
- **Word**: `.docx` files using mammoth
- **JSON**: `.json` structured data files

### AI Model Configuration
- **Temperature**: 0.7 (balanced creativity/accuracy)
- **Max Tokens**: 1500 (optimal response length)
- **Similarity Threshold**: 0.6-0.8 (RAG relevance)
- **Context Limit**: 3 documents per query

### API Endpoints
- **Chat**: `POST /api/chat/message`
- **RAG**: `POST /api/chat/conversation`
- **Upload**: `POST /api/chat/embeddings/upload`
- **Search**: `POST /api/chat/embeddings/search`
- **Health**: `GET /api/health`
- **Docs**: `GET /api-docs` (Swagger UI)

## 🧪 Testing

```bash
# Run all tests
yarn test

# Watch mode
yarn test:watch

# Coverage report
yarn test:coverage
```

## 📚 API Documentation

Swagger UI available at: `http://localhost:5050/api-docs`
- Create register account via swagger
- Login account testing

## 🔒 Security Features

- JWT authentication with refresh tokens
- bcrypt password hashing
- CORS protection
- File type validation
- Size limits (10MB max)
- Environment variable configuration

## 🚀 Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set secure JWT secrets
4. Configure LMStudio for production

### Build & Deploy
```bash
yarn build
yarn start
```

The application will be available at `http://localhost:5050` with the React client served from the Express server.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## 📄 License

ISC License - see LICENSE file for details.
        