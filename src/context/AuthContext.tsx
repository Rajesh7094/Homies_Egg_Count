import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { mockStorage, ADMIN_EMAIL } from '../services/mockStorage';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  availableUsers: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session key — uses sessionStorage so it clears when browser tab/window closes
// This means every fresh visit to the Vercel URL shows the Login page
const SESSION_KEY = 'bachelor_egg_session_user_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Load all users into the switcher list (for login page display)
    const users = mockStorage.getUsers();
    setAvailableUsers(users);

    // Restore session only from sessionStorage (clears on browser close)
    const sessionId = sessionStorage.getItem(SESSION_KEY);
    if (sessionId) {
      const found = users.find(u => u.id === sessionId && u.status === 'active');
      if (found) {
        setCurrentUser(found);
      } else {
        // Session user was deleted/disabled — force re-login
        sessionStorage.removeItem(SESSION_KEY);
      }
    }
    // If no session → currentUser stays null → LoginPage is shown

    // Listen for user list changes from AppContext (add/edit/delete user)
    const handleUsersChanged = () => {
      const updatedUsers = mockStorage.getUsers();
      setAvailableUsers(updatedUsers);

      // If the currently logged-in user was edited (e.g. name change), refresh their data
      const sessionId = sessionStorage.getItem(SESSION_KEY);
      if (sessionId) {
        const refreshed = updatedUsers.find(u => u.id === sessionId && u.status === 'active');
        if (refreshed) {
          setCurrentUser(refreshed);
        } else {
          // Logged-in user disabled/deleted → force logout
          setCurrentUser(null);
          sessionStorage.removeItem(SESSION_KEY);
        }
      }
    };

    window.addEventListener('bachelor-users-changed', handleUsersChanged);
    return () => window.removeEventListener('bachelor-users-changed', handleUsersChanged);
  }, []);

  /**
   * Login with email + password validation.
   * Password is stored on each User record (set by Admin when creating users).
   */
  const login = (email: string, password: string): { success: boolean; error?: string } => {
    const users = mockStorage.getUsers();
    const target = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!target) {
      return { success: false, error: 'No account found with this email address.' };
    }
    if (target.status === 'inactive') {
      return { success: false, error: 'Your account is disabled. Contact Admin.' };
    }

    // Admin password check accepts both rajesh123 and rajesh@123
    const isTargetAdmin = target.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    if (isTargetAdmin) {
      const isPassValid = password === 'rajesh123' || password === 'rajesh@123' || password === target.password;
      if (!isPassValid) {
        return { success: false, error: 'Incorrect password. Please try again.' };
      }
    } else {
      if (!target.password || target.password !== password) {
        return { success: false, error: 'Incorrect password. Please try again.' };
      }
    }

    setCurrentUser(target);
    sessionStorage.setItem(SESSION_KEY, target.id);
    return { success: true };
  };


  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem(SESSION_KEY);
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        login,
        logout,
        availableUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
