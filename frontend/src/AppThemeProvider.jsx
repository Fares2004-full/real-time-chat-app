import { useMemo } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { buildTheme } from './theme';
import { useUser } from './context/UserContext';

// Reads the signed-in user's saved theme (server-side, syncs across devices)
// and falls back to light mode before login / for guests who haven't set one.
export default function AppThemeProvider({ children }) {
  const { user } = useUser();
  const mode = user?.theme === 'dark' ? 'dark' : 'light';
  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
