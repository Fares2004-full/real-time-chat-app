import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import http from '../api/http';
import { connectSocket, disconnectSocket } from '../api/socket';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null); // { userId, nickname, avatar, theme }
  const [loading, setLoading] = useState(true);

  // On boot: restore the guest session from the id saved in localStorage.
  useEffect(() => {
    (async () => {
      const storedId = localStorage.getItem('guestUserId');
      if (storedId) {
        try {
          const { data } = await http.get('/users/me');
          setUser(data);
          connectSocket(storedId);
        } catch {
          localStorage.removeItem('guestUserId');
        }
      }
      setLoading(false);
    })();
  }, []);

  const createGuest = useCallback(async (nickname) => {
    const { data } = await http.post('/guest', { nickname });
    localStorage.setItem('guestUserId', data.userId);
    setUser({ userId: data.userId, nickname: data.nickname, avatar: null, theme: data.theme || 'light' });
    connectSocket(data.userId);
  }, []);

  // Any of nickname / theme / avatarFile may be omitted.
  const updateProfile = useCallback(async ({ nickname, theme, avatarFile }) => {
    const form = new FormData();
    if (nickname !== undefined) form.append('nickname', nickname);
    if (theme !== undefined) form.append('theme', theme);
    if (avatarFile) form.append('avatar', avatarFile);
    const { data } = await http.patch('/users/me', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    setUser((prev) => ({ ...prev, ...data }));
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('guestUserId');
    disconnectSocket();
    setUser(null);
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, createGuest, updateProfile, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
