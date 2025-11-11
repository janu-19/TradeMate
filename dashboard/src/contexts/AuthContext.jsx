import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Set default authorization header for axios
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      verifyToken();
    } else {
      setLoading(false);
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await axios.get('http://localhost:3002/verify');
      setUser(response.data.user);
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password) => {
    try {
      console.log('🔄 Attempting signup for:', email);
      const response = await axios.post('http://localhost:3002/signup', {
        name,
        email,
        password
      });
      
      console.log('✅ Signup response:', response.data);
      
      if (!response.data || !response.data.token || !response.data.user) {
        console.error('❌ Invalid response format:', response.data);
        return {
          success: false,
          error: 'Invalid response from server'
        };
      }
      
      const { token: newToken, user: newUser } = response.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return { success: true };
    } catch (error) {
      console.error('❌ Signup error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error message:', error.message);
      
      // Handle different error types
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        return {
          success: false,
          error: 'Cannot connect to server. Please make sure the backend is running on port 3002.'
        };
      }
      
      if (error.response?.status === 400) {
        return {
          success: false,
          error: error.response.data?.error || 'Invalid signup data'
        };
      }
      
      if (error.response?.status === 500) {
        return {
          success: false,
          error: error.response.data?.error || 'Server error. Please try again later.'
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Signup failed. Please try again.'
      };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:3002/login', {
        email,
        password
      });
      
      const { token: newToken, user: newUser } = response.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    token,
    loading,
    signup,
    login,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

