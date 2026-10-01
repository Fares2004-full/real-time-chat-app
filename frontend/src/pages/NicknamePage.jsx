import { useState } from 'react';
import { Box, Paper, TextField, Button, Typography, Avatar, CircularProgress } from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import { useUser } from '../context/UserContext';

export default function NicknamePage() {
  const { createGuest } = useUser();
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (!trimmed) {
      setError('من فضلك اكتب اسمًا');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await createGuest(trimmed);
    } catch {
      setError('حدث خطأ، حاول تاني');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 380, textAlign: 'center' }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mx: 'auto', mb: 2 }}>
          <ChatBubbleOutlineIcon />
        </Avatar>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          مرحبًا بك
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          اكتب اسمك للدخول كضيف — بدون تسجيل أو كلمة مرور
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            autoFocus
            label="اسمك (Nickname)"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            error={!!error}
            helperText={error}
            inputProps={{ maxLength: 30 }}
            sx={{ mb: 2 }}
          />
          <Button type="submit" fullWidth variant="contained" size="large" disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'ادخل'}
          </Button>
        </Box>

      </Paper>
    </Box>
  );
}
