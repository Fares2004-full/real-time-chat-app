import { useMemo, useState } from 'react';
import {
  Box,
  Toolbar,
  Typography,
  IconButton,
  TextField,
  List,
  Tooltip,
  InputAdornment,
  Divider
} from '@mui/material';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import SearchIcon from '@mui/icons-material/Search';
import UserAvatar from './UserAvatar';
import ConversationListItem from './ConversationListItem';
import ProfileDialog from './ProfileDialog';
import { useUser } from '../context/UserContext';

export default function Sidebar({
  conversations,
  selectedId,
  onSelect,
  onOpenNewChat,
  onOpenNewGroup
}) {
  const { user, logout } = useUser();
  const [filter, setFilter] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);

  const filtered = useMemo(
    () => conversations.filter((c) => c.name?.toLowerCase().includes(filter.toLowerCase())),
    [conversations, filter]
  );

  return (
    <Box sx={{ width: 340, borderInlineEnd: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
        <Tooltip title="الملف الشخصي">
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden', cursor: 'pointer' }}
            onClick={() => setProfileOpen(true)}
          >
            <UserAvatar name={user?.nickname} size={36} src={user?.avatar} />
            <Typography noWrap fontWeight={700}>
              {user?.nickname}
            </Typography>
          </Box>
        </Tooltip>
        <Box>
          <Tooltip title="محادثة جديدة">
            <IconButton onClick={onOpenNewChat}>
              <ChatOutlinedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="مجموعة جديدة">
            <IconButton onClick={onOpenNewGroup}>
              <GroupAddOutlinedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="خروج">
            <IconButton onClick={logout}>
              <LogoutOutlinedIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
      <Divider />
      <Box sx={{ p: 1.5 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="ابحث في المحادثات"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            )
          }}
        />
      </Box>
      <List sx={{ flex: 1, overflowY: 'auto', px: 1 }}>
        {filtered.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
            لا توجد محادثات بعد
          </Typography>
        )}
        {filtered.map((c) => (
          <ConversationListItem
            key={c.conversationId}
            conversation={c}
            selected={c.conversationId === selectedId}
            onClick={() => onSelect(c.conversationId)}
          />
        ))}
      </List>

      <ProfileDialog open={profileOpen} onClose={() => setProfileOpen(false)} />
    </Box>
  );
}
