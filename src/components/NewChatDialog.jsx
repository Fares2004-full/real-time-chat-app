import { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Box,
  Typography
} from '@mui/material';
import http from '../api/http';
import UserAvatar from './UserAvatar';

export default function NewChatDialog({ open, onClose, onStartChat }) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setUsers([]);
    search('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const search = async (q) => {
    setLoading(true);
    try {
      const { data } = await http.get('/users/search', { params: { q } });
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  const debounceRef = useRef(null);
  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 300);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>بدء محادثة جديدة</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          autoFocus
          placeholder="ابحث بالاسم..."
          value={query}
          onChange={handleChange}
          sx={{ mb: 2, mt: 1 }}
        />
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={28} />
          </Box>
        ) : users.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            لا يوجد مستخدمون
          </Typography>
        ) : (
          <List>
            {users.map((u) => (
              <ListItemButton key={u.userId} onClick={() => onStartChat(u.userId)} sx={{ borderRadius: 2 }}>
                <ListItemAvatar>
                  <UserAvatar name={u.nickname} online={u.online} />
                </ListItemAvatar>
                <ListItemText primary={u.nickname} secondary={u.online ? 'متصل الآن' : 'غير متصل'} />
              </ListItemButton>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}
