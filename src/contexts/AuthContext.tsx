
import React, { createContext, useState, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../types/models';
import { getDB } from '../services/db';
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
        setUser(JSON.parse(storedUser));
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
      const db = await getDB();
      const userRecord = await db.get('users', email);
      
      if (!userRecord) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "User not found. Please check your email or register."
        });
        return false;
      }

      if (userRecord.password !== password) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Incorrect password. Please try again."
        });
        return false;
      }

      setUser(userRecord);
      localStorage.setItem('pharmacy-user', JSON.stringify(userRecord));
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${userRecord.name}!`
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
      const db = await getDB();
      
      // Check if user already exists
      const existingUser = await db.get('users', email);
      if (existingUser) {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: "Email already registered. Please login instead."
        });
        return false;
      }

      const newUser: User = {
        id: uuidv4(),
        name,
        email,
        password,
        role,
        createdAt: new Date()
      };

      await db.put('users', newUser);
      
      setUser(newUser);
      localStorage.setItem('pharmacy-user', JSON.stringify(newUser));
      
      toast({
        title: "Registration Successful",
        description: "Your account has been created successfully!"
      });
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        variant: "destructive",
        title: "Registration Error",
        description: "An error occurred during registration. Please try again."
      });
      return false;
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('pharmacy-user');
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
