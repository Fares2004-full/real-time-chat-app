import { useRef, useState } from 'react';
import { Box, TextField, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

export default function MessageInput({ onSend, onTypingStart, onTypingStop }) {
  const [value, setValue] = useState('');
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const stopTyping = () => {
    if (isTypingRef.current) {
      isTypingRef.current = false;
      onTypingStop();
    }
    clearTimeout(typingTimeoutRef.current);
  };

  const handleChange = (e) => {
    setValue(e.target.value);
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onTypingStart();
    }
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(stopTyping, 2000);
  };

  const handleSend = () => {
    const text = value.trim();
    if (!text) return;
    onSend(text);
    setValue('');
    stopTyping();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, p: 1.5, borderTop: '1px solid #e0e0e0' }}>
      <TextField
        fullWidth
        multiline
        maxRows={4}
        placeholder="اكتب رسالة..."
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={stopTyping}
        size="small"
      />
      <IconButton color="primary" onClick={handleSend} disabled={!value.trim()}>
        <SendIcon />
      </IconButton>
    </Box>
  );
}
