import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import { getCurrentUser } from './services/api';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        // Verify token is still valid
        const response = await getCurrentUser();
        setCurrentUser(response.data.user);
        setIsAuthenticated(true);
      } catch (error) {
        // Token is invalid, clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Dashboard 
      currentUser={currentUser} 
      onLogout={handleLogout}
    />
  );
}

export default App;