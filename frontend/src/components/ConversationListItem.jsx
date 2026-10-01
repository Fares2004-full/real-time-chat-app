import { ListItemButton, ListItemAvatar, ListItemText, Typography, Badge, Box } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import { Avatar } from '@mui/material';
import UserAvatar from './UserAvatar';

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
}

export default function ConversationListItem({ conversation, selected, onClick }) {
  const isGroup = conversation.type === 'group';

  return (
    <ListItemButton selected={selected} onClick={onClick} sx={{ borderRadius: 2, mb: 0.5 }}>
      <ListItemAvatar>
        {isGroup ? (
          <Avatar sx={{ bgcolor: 'secondary.main' }}>
            <GroupIcon />
          </Avatar>
        ) : (
          <UserAvatar
            name={conversation.name}
            online={conversation.otherUser?.online}
            src={conversation.otherUser?.avatar}
          />
        )}
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography noWrap fontWeight={conversation.unreadCount ? 700 : 500}>
              {conversation.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatTime(conversation.lastMessage?.createdAt)}
            </Typography>
          </Box>
        }
        secondary={
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 170 }}>
              {conversation.lastMessage?.content || 'لا توجد رسائل بعد'}
            </Typography>
            {conversation.unreadCount > 0 && (
              <Badge color="primary" badgeContent={conversation.unreadCount} sx={{ mr: 1 }} />
            )}
          </Box>
        }
      />
    </ListItemButton>
  );
}
