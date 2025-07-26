import React, { useState, useEffect } from 'react';
import api from '../services/api';

function EmbeddingSection({ currentUser }) {
  const [embeddings, setEmbeddings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Supported file types
  const supportedTypes = {
    '.pdf': 'PDF Documents',
    '.txt': 'Text Files',
    '.docx': 'Word Documents',
    '.json': 'JSON Files'
  };

  useEffect(() => {
    fetchEmbeddings();
  }, []);

  const fetchEmbeddings = async () => {
    try {
      // This would be your actual embedding API endpoint
      const response = await api.get('/embeddings');
      setEmbeddings(response.data);
    } catch (error) {
      console.error('Error fetching embeddings:', error);
      // Mock data for demonstration
      setEmbeddings([
        {
          id: 1,
          filename: 'document1.pdf',
          content: 'Sample document content about machine learning...',
          uploadedAt: new Date().toISOString(),
          size: '2.5 MB'
        },
        {
          id: 2,
          filename: 'research_paper.pdf',
          content: 'Research paper on natural language processing...',
          uploadedAt: new Date().toISOString(),
          size: '1.8 MB'
        },
        {
          id: 3,
          filename: 'knowledge_base.json',
          content: 'JSON structured knowledge base with multiple documents...',
          uploadedAt: new Date().toISOString(),
          size: '1.2 MB'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const validateFile = (file) => {
    const allowedTypes = ['.pdf', '.txt', '.docx', '.json'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      return `Unsupported file type. Please upload: ${Object.values(supportedTypes).join(', ')}`;
    }
    
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return 'File size must be less than 10MB';
    }
    
    return null;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUploadError('');
    
    if (file) {
      const error = validateFile(file);
      if (error) {
        setUploadError(error);
        setUploadFile(null);
        e.target.value = ''; // Clear the input
      } else {
        setUploadFile(file);
      }
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;
  
    setUploading(true);
    setUploadError('');
    
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      
      // Call upload endpoint
      const response = await api.post('/chat/embeddings/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Update embeddings list with new upload
      if (response.data.success) {
        const newEmbedding = {
          id: Date.now(),
          filename: response.data.data.filename,
          content: `Processed ${response.data.data.totalChunks} chunks from uploaded document`,
          uploadedAt: new Date().toISOString(),
          size: (uploadFile.size / (1024 * 1024)).toFixed(2) + ' MB',
          chunks: response.data.data.totalChunks,
          embeddings: response.data.data.embeddingsCreated
        };
        setEmbeddings(prev => [newEmbedding, ...prev]);
        setUploadFile(null);
        
        // Clear the file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
        
        alert(`Successfully uploaded and processed ${response.data.data.filename}!`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      const errorMessage = error.response?.data?.error || 'Error uploading file. Please try again.';
      setUploadError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      // This would be your actual search endpoint
      const response = await api.post('/chat/embeddings/search', {
        query: searchQuery,
        limit: 5,
        threshold: 0.7
      });
      
      if (response.data.success) {
        setSearchResults(response.data.data.results);
      }
    } catch (error) {
      console.error('Error searching embeddings:', error);
      // Mock search results
      setSearchResults([
        {
          id: 1,
          filename: 'document1.pdf',
          content: `Relevant content matching "${searchQuery}"...`,
          similarity: 0.95
        }
      ]);
    } finally {
      setSearching(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading embedding data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Documents</h2>
        
        {/* Supported file types info */}
        <div className="mb-4 p-3 bg-blue-50 rounded-md">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Supported File Types:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-blue-700">
            {Object.entries(supportedTypes).map(([ext, desc]) => (
              <div key={ext} className="flex items-center">
                <span className="font-mono bg-blue-100 px-2 py-1 rounded text-xs mr-2">{ext}</span>
                <span>{desc}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-blue-600 mt-2">Maximum file size: 10MB</p>
        </div>
        
        <form onSubmit={handleFileUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select file to upload
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.txt,.doc,.docx,.json"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {uploadFile && (
              <div className="mt-2 text-sm text-green-600">
                Selected: {uploadFile.name} ({(uploadFile.size / (1024 * 1024)).toFixed(2)} MB)
              </div>
            )}
            {uploadError && (
              <div className="mt-2 text-sm text-red-600">
                {uploadError}
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={!uploadFile || uploading || uploadError}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            {uploading ? 'Uploading & Processing...' : 'Upload & Process'}
          </button>
        </form>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Search Embeddings</h2>
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search query
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter your search query..."
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={!searchQuery.trim() || searching}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-6">
            <h3 className="text-md font-medium text-gray-900 mb-3">Search Results</h3>
            <div className="space-y-3">
              {searchResults.map((result) => (
                <div key={result.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{result.filename}</h4>
                    {result.similarity && (
                      <span className="text-sm text-green-600 font-medium">
                        {(result.similarity * 100).toFixed(1)}% match
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">{result.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Embeddings List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Uploaded Documents</h2>
        {embeddings.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No documents uploaded yet.</p>
        ) : (
          <div className="space-y-4">
            {embeddings.map((embedding) => (
              <div key={embedding.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900">{embedding.filename}</h3>
                  <div className="text-right">
                    <span className="text-sm text-gray-500 block">{embedding.size}</span>
                    {embedding.chunks && (
                      <span className="text-xs text-blue-600">
                        {embedding.chunks} chunks, {embedding.embeddings} embeddings
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-2">{embedding.content}</p>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-400">
                    Uploaded: {new Date(embedding.uploadedAt).toLocaleString()}
                  </p>
                  <div className="flex items-center space-x-2">
                    {embedding.filename.endsWith('.json') && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        JSON
                      </span>
                    )}
                    {embedding.filename.endsWith('.pdf') && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        PDF
                      </span>
                    )}
                    {embedding.filename.endsWith('.txt') && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        TXT
                      </span>
                    )}
                    {embedding.filename.endsWith('.docx') && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        DOCX
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default EmbeddingSection;