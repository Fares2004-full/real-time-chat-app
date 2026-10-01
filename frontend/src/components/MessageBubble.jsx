import { Box, Typography } from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
}

export default function MessageBubble({ message, isOwn, showSenderName, seen, pending }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start', mb: 1 }}>
      <Box
        sx={{
          maxWidth: '70%',
          bgcolor: isOwn ? 'primary.main' : '#fff',
          color: isOwn ? '#fff' : 'text.primary',
          px: 1.75,
          py: 1,
          borderRadius: 2,
          borderTopRightRadius: isOwn ? 4 : 16,
          borderTopLeftRadius: isOwn ? 16 : 4,
          boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
          opacity: pending ? 0.6 : 1
        }}
      >
        {showSenderName && !isOwn && (
          <Typography variant="caption" fontWeight={700} color="primary.main" display="block">
            {message.senderNickname}
          </Typography>
        )}
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {message.content}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
          <Typography variant="caption" sx={{ opacity: 0.75 }}>
            {formatTime(message.createdAt)}
          </Typography>
          {isOwn && (seen ? <DoneAllIcon sx={{ fontSize: 15 }} /> : <DoneIcon sx={{ fontSize: 15 }} />)}
        </Box>
      </Box>
    </Box>
  );
}
