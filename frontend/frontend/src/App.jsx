import { Box, CircularProgress } from '@mui/material';
import { useUser } from './context/UserContext';
import NicknamePage from './pages/NicknamePage';
import ChatPage from './pages/ChatPage';

export default function App() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return user ? <ChatPage /> : <NicknamePage />;
}
