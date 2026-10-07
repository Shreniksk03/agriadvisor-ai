import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const DEFAULT_MOCK_USER = {
  name: 'Dr. Evelyn Vance',
  full_name: 'Dr. Evelyn Vance',
  email: 'evelyn@agriadvisor.ai',
  role: 'Lead Agronomist',
  avatar: 'EV',
};

// Valid fallback token for local dev and direct access
const DEFAULT_MOCK_TOKEN = 'mock-hackathon-bypass-token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(DEFAULT_MOCK_USER);
  const [token, setToken] = useState(DEFAULT_MOCK_TOKEN);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('agri_token');
    const savedUser = localStorage.getItem('agri_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(DEFAULT_MOCK_USER);
        setToken(DEFAULT_MOCK_TOKEN);
      }
    } else {
      localStorage.setItem('agri_token', DEFAULT_MOCK_TOKEN);
      localStorage.setItem('agri_user', JSON.stringify(DEFAULT_MOCK_USER));
    }
  }, []);

  const login = (tokenValue, userData) => {
    localStorage.setItem('agri_token', tokenValue || DEFAULT_MOCK_TOKEN);
    localStorage.setItem('agri_user', JSON.stringify(userData || DEFAULT_MOCK_USER));
    setToken(tokenValue || DEFAULT_MOCK_TOKEN);
    setUser(userData || DEFAULT_MOCK_USER);
  };

  const logout = () => {
    setUser(DEFAULT_MOCK_USER);
    setToken(DEFAULT_MOCK_TOKEN);
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || DEFAULT_MOCK_USER,
        token: token || DEFAULT_MOCK_TOKEN,
        loading: false,
        login,
        logout,
        isAuthenticated: true,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export default AuthContext;
