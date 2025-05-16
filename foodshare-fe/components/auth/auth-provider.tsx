"use client";

import React, { createContext, useState, useEffect, useContext } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  [key: string]: any; // For other user properties
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (userData: any) => void;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  isLoggingOut: boolean;
  isLoading: boolean;
}

// Default context values
const defaultContext: AuthContextType = {
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: async () => {},
  updateUser: () => {},
  isLoggingOut: false,
  isLoading: true,
};

// Create authentication context
const AuthContext = createContext<AuthContextType>(defaultContext);

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to get cookie value
  const getCookie = (name: string) => {
    if (typeof window === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };
  
  // Helper function to check if token is valid and not expired
  const isTokenValid = (token: string): boolean => {
    try {
      // JWT consists of three parts: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      // Decode the payload (the middle part)
      const payload = JSON.parse(atob(parts[1]));
      
      // Check if token has expiration
      if (!payload.exp) return true; // If no expiration, consider valid
      
      // Check expiration time (exp field in JWT)
      return payload.exp * 1000 > Date.now();
    } catch (e) {
      console.error('Error validating token:', e);
      return false;
    }
  };

  // Initialize auth state on mount
  useEffect(() => {
    // Only run on client-side
    if (typeof window !== 'undefined') {
      setIsLoading(true);
      
      // Check for stored authentication - first from localStorage, then try cookies
      let token = localStorage.getItem('token');
      
      // If token isn't in localStorage, check cookies (middleware might have set it)
      if (!token) {
        token = getCookie('token');
        // If found in cookie but not localStorage, sync them
        if (token) {
          localStorage.setItem('token', token);
        }
      }
      
      // Validate token if it exists
      if (token && !isTokenValid(token)) {
        console.log('Token exists but is invalid or expired, clearing it');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
        token = null;
      }
      
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setIsAuthenticated(true);
          setUser(userData);
          
          // Ensure cookie is set for middleware
          if (token && getCookie('token') !== token) {
            document.cookie = `token=${token}; path=/; max-age=2592000; SameSite=Strict`;
          }
        } catch (error) {
          console.error('Failed to parse user data:', error);
          // Clear invalid data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
        }
      }
      setIsLoading(false);
    }
  }, []);

  // Login function
  const login = (userData: any) => {
    if (!userData) return;

    // Get user data
    const userObject = userData.user || userData;
    
    // Store token
    if (typeof window !== 'undefined') {
      const token = userData.access_token;
      if (token) {
        localStorage.setItem('token', token);
        
        // Also set the token in cookies for middleware access
        document.cookie = `token=${token}; path=/; max-age=2592000; SameSite=Strict`;
      }

      // Store user data
      localStorage.setItem('user', JSON.stringify(userObject));
    }
    
    // Update state
    setIsAuthenticated(true);
    setUser(userObject);
  };

  // Logout function with API call
  const logout = async () => {
    try {
      setIsLoggingOut(true);
      
      if (typeof window !== 'undefined') {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const token = localStorage.getItem('token');
        
        if (token) {
          // Call the logout API endpoint
          await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }).catch(error => {
            // Still proceed with local logout even if API call fails
            console.error('Logout API call failed:', error);
          });
        }
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Always clear local storage, cookies and state
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Clear the auth cookie
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
      }
      setIsAuthenticated(false);
      setUser(null);
      setIsLoggingOut(false);
    }
  };

  // Update user data
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Ensure token is valid in both localStorage and cookies
        const token = localStorage.getItem('token');
        if (token) {
          // Verify token is valid before refreshing
          if (isTokenValid(token)) {
            // Refresh the token in cookies to prevent expiration issues
            document.cookie = `token=${token}; path=/; max-age=2592000; SameSite=Strict`;
            console.log('Token refreshed in cookies during user update');
          } else {
            console.warn('Token is invalid or expired during user update, clearing authentication');
            // Clear authentication state
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
            setIsAuthenticated(false);
            setUser(null);
            // Redirect to login if in browser environment
            if (typeof window !== 'undefined') {
              window.location.href = '/login?error=session_expired';
            }
          }
        } else {
          console.warn('No token found during user update');
        }
      }
    }
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    updateUser,
    isLoggingOut,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 