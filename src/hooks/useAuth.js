import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/mockApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Mock user authentication
      setUser({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        plan: 'basic'
      });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.login(email, password);
    localStorage.setItem('token', response.token);
    setUser(response.user);
    return response;
  };

  const signup = async (userData) => {
    const response = await api.signup(userData);
    localStorage.setItem('token', response.token);
    setUser(response.user);
    return response;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
