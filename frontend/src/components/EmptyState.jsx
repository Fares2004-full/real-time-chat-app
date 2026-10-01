import { Box, Typography, Avatar } from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';

export default function EmptyState() {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'text.secondary',
        gap: 1.5
      }}
    >
      <Avatar sx={{ width: 64, height: 64, bgcolor: '#e0e0e0' }}>
        <ChatBubbleOutlineIcon sx={{ fontSize: 32, color: '#9e9e9e' }} />
      </Avatar>
      <Typography>اختر محادثة للبدء، أو ابدأ محادثة جديدة</Typography>
    </Box>
  );
}
