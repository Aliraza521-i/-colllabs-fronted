import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI, handleApiError } from '../services/api';

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
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Check if user is logged in on app start
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      
      if (response.data.ok) {
        const { token: newToken, data: userData, role } = response.data;
        
        const userObj = {
          ...userData,
          role: role || userData.role
        };
        
        setUser(userObj);
        setToken(newToken);
        
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userObj));
        
        return { success: true, user: userObj };
      } else {
        return { success: false, message: response.data.message || 'Login failed' };
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      return { success: false, message: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      if (response.data.ok) {
        const { token: newToken, data: newUser } = response.data;
        
        setUser(newUser);
        setToken(newToken);
        
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        
        return { success: true, user: newUser };
      } else {
        return { success: false, message: response.data.message || 'Registration failed' };
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      return { success: false, message: errorMessage };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Optional: Call logout API endpoint
    authAPI.logout().catch(console.error);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const switchRole = async (newRole) => {
    if (user && (newRole === 'publisher' || newRole === 'advertiser' || newRole === 'admin')) {
      try {
        console.log('Switching role to:', newRole);
        // Update role in backend
        const response = await userAPI.updateRole(newRole);
        console.log('Role update response:', response);
        
        if (response.data.ok) {
          const { token: newToken, data: updatedUserData } = response.data;
          console.log('New token:', newToken);
          console.log('Updated user data:', updatedUserData);
          
          // Update state with new user data and token
          setUser(updatedUserData);
          setToken(newToken);
          
          // Update localStorage with new token and user data
          localStorage.setItem('token', newToken);
          localStorage.setItem('user', JSON.stringify(updatedUserData));
          
          // Verify the token is updated
          console.log('Token after update:', localStorage.getItem('token'));
          console.log('User after update:', localStorage.getItem('user'));
          
          // Add a longer delay to ensure token propagation
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Verify token is properly set before returning
          const storedToken = localStorage.getItem('token');
          console.log('Final verification - Stored token:', storedToken);
          
          return updatedUserData;
        } else {
          console.error('Failed to update role:', response.data.message);
          return null;
        }
      } catch (error) {
        console.error('Error updating role:', error);
        return null;
      }
    }
    return null;
  };

  const isAuthenticated = () => {
    return !!(user && token);
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const isPublisher = () => hasRole('publisher');
  const isAdvertiser = () => hasRole('advertiser');
  const isAdmin = () => hasRole('admin');

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    switchRole, // Add switchRole to context
    isAuthenticated,
    hasRole,
    isPublisher,
    isAdvertiser,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};