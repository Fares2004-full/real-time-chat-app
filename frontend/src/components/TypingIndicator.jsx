import { Box } from '@mui/material';

const dotSx = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  bgcolor: 'text.secondary',
  animation: 'typingBounce 1.2s infinite',
  '@keyframes typingBounce': {
    '0%, 60%, 100%': { transform: 'translateY(0)', opacity: 0.4 },
    '30%': { transform: 'translateY(-4px)', opacity: 1 }
  }
};

export default function TypingIndicator() {
  return (
    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', px: 2, py: 1 }}>
      <Box sx={{ ...dotSx, animationDelay: '0s' }} />
      <Box sx={{ ...dotSx, animationDelay: '0.15s' }} />
      <Box sx={{ ...dotSx, animationDelay: '0.3s' }} />
    </Box>
  );
}
