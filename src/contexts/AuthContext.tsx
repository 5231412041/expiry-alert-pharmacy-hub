
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '../types/models';
import { authAPI } from '../services/api';
import { toast } from '../components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: 'admin' | 'staff') => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => false,
  register: async () => false,
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('pharmacy-user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        // Also set the auth token
        const token = localStorage.getItem('auth-token');
        if (token) {
          authAPI.setAuthToken(token);
        }
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('pharmacy-user');
      }
    }
    setIsLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.login(email, password);
      
      if (!response || !response.user) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Invalid credentials. Please try again."
        });
        return false;
      }

      setUser(response.user);
      localStorage.setItem('pharmacy-user', JSON.stringify(response.user));
      
      // Store token if available
      if (response.token) {
        authAPI.setAuthToken(response.token);
      }
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${response.user.name}!`
      });
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Login Error",
        description: "An error occurred during login. Please try again."
      });
      return false;
    }
  };

  // Register function
  const register = async (
    name: string, 
    email: string, 
    password: string, 
    role: 'admin' | 'staff'
  ): Promise<boolean> => {
    try {
      const response = await authAPI.register(name, email, password, role);
      
      if (!response || !response.user) {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: response?.message || "Failed to create account."
        });
        return false;
      }

      setUser(response.user);
      localStorage.setItem('pharmacy-user', JSON.stringify(response.user));
      
      // Store token if available
      if (response.token) {
        authAPI.setAuthToken(response.token);
      }
      
      toast({
        title: "Registration Successful",
        description: "Your account has been created successfully!"
      });
      
      return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = "An error occurred during registration.";
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      toast({
        variant: "destructive",
        title: "Registration Error",
        description: errorMessage
      });
      return false;
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('pharmacy-user');
    localStorage.removeItem('auth-token');
    authAPI.setAuthToken(null);
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully."
    });
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
