import { useState, useEffect } from 'react';
import { UserProfile } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const storedUser = localStorage.getItem('aether_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('aether_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (): Promise<void> => {
    // This is a placeholder for external auth triggers.
    // We don't set global loading here anymore to prevent the LoginScreen from unmounting.
    return Promise.resolve();
  };

  const completeLogin = (profile: UserProfile) => {
    localStorage.setItem('aether_user', JSON.stringify(profile));
    setUser(profile);
  };

  const loginGuest = async () => {
    setLoading(true);
    // Guest login is fast, but we simulate a tiny bit of processing
    await new Promise(resolve => setTimeout(resolve, 300));
    const guestUser: UserProfile = {
      id: `guest_${Date.now()}`,
      name: 'Guest Explorer',
      email: '',
      photoURL: 'https://ui-avatars.com/api/?name=Guest+User&background=2a2f3a&color=00d4ff',
      isGuest: true,
      syncEnabled: false
    };
    completeLogin(guestUser);
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('aether_user');
    setUser(null);
  };

  return { user, loading, login, completeLogin, loginGuest, logout };
};