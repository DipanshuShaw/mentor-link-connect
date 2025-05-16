
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

// Define user types
export type UserRole = "admin" | "mentor" | "student";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initialize mock users from local storage or use default if not available
const getInitialMockUsers = (): User[] => {
  const storedMockUsers = localStorage.getItem("mockUsers");
  if (storedMockUsers) {
    try {
      return JSON.parse(storedMockUsers);
    } catch (error) {
      console.error("Failed to parse stored mock users:", error);
    }
  }

  // Default mock users if none in storage
  return [
    {
      id: "1",
      name: "Admin User",
      email: "admin@example.com",
      role: "admin"
    },
    {
      id: "2",
      name: "Mentor User",
      email: "mentor@example.com",
      role: "mentor"
    },
    {
      id: "3",
      name: "Student User",
      email: "student@example.com",
      role: "student"
    }
  ];
};

// Store mock passwords for this demo
// In a real application, passwords would be hashed and stored securely
interface MockUserCredential {
  email: string;
  password: string;
}

const getInitialUserCredentials = (): MockUserCredential[] => {
  const storedCredentials = localStorage.getItem("userCredentials");
  if (storedCredentials) {
    try {
      return JSON.parse(storedCredentials);
    } catch (error) {
      console.error("Failed to parse stored credentials:", error);
    }
  }

  // Default credentials (all use "password" for demo)
  return [
    { email: "admin@example.com", password: "password" },
    { email: "mentor@example.com", password: "password" },
    { email: "student@example.com", password: "password" }
  ];
};

// Authentication provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mockUsers, setMockUsers] = useState<User[]>(getInitialMockUsers());
  const [userCredentials, setUserCredentials] = useState<MockUserCredential[]>(getInitialUserCredentials());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Save mockUsers to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("mockUsers", JSON.stringify(mockUsers));
  }, [mockUsers]);

  // Save credentials to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("userCredentials", JSON.stringify(userCredentials));
  }, [userCredentials]);

  // Check if a user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  // Mock login function
  const login = async (email: string, password: string) => {
    // Simulate API call
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Fake delay
      
      // Find user with matching email
      const foundUser = mockUsers.find(u => u.email === email);
      
      if (!foundUser) {
        throw new Error("Invalid credentials");
      }

      // Find user credentials
      const userCredential = userCredentials.find(c => c.email === email);
      
      if (!userCredential || userCredential.password !== password) {
        throw new Error("Invalid credentials");
      }

      // Store user in local storage
      localStorage.setItem("user", JSON.stringify(foundUser));
      setUser(foundUser);
      toast.success(`Welcome back, ${foundUser.name}!`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Mock register function
  const register = async (name: string, email: string, password: string, role: UserRole) => {
    // Simulate API call
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Fake delay
      
      // Check if email exists
      if (mockUsers.some(u => u.email === email)) {
        throw new Error("Email already in use");
      }

      // Create new user
      const newUser: User = {
        id: String(mockUsers.length + 1),
        name,
        email,
        role
      };

      // Update mock users
      const updatedMockUsers = [...mockUsers, newUser];
      setMockUsers(updatedMockUsers);

      // Store user credentials
      const updatedCredentials = [...userCredentials, { email, password }];
      setUserCredentials(updatedCredentials);

      // Store user in local storage
      localStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);
      toast.success("Registration successful!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    toast.info("You have been logged out");
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        login, 
        register, 
        logout, 
        isAuthenticated: !!user 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
