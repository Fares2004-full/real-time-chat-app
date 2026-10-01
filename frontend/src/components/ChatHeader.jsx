import { useState } from 'react';
import {
  Box,
  Toolbar,
  Typography,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import EditIcon from '@mui/icons-material/EditOutlined';
import UserAvatar from './UserAvatar';

export default function ChatHeader({ conversation, typingText, onRenameGroup }) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  if (!conversation) return null;
  const isGroup = conversation.type === 'group';
  const canRename = isGroup && conversation.myRole === 'owner';

  const openRename = () => {
    setName(conversation.name);
    setRenameOpen(true);
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await onRenameGroup(conversation.conversationId, trimmed);
      setRenameOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Toolbar sx={{ borderBottom: '1px solid #e0e0e0', gap: 1.5 }}>
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
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <Typography fontWeight={700} noWrap>
            {conversation.name}
          </Typography>
          <Typography variant="caption" color={typingText ? 'primary.main' : 'text.secondary'}>
            {typingText ||
              (isGroup
                ? `${conversation.memberCount} أعضاء`
                : conversation.otherUser?.online
                ? 'متصل الآن'
                : 'غير متصل')}
          </Typography>
        </Box>
        {canRename && (
          <IconButton size="small" onClick={openRename} title="تغيير اسم المجموعة">
            <EditIcon fontSize="small" />
          </IconButton>
        )}
      </Toolbar>

      <Dialog open={renameOpen} onClose={() => setRenameOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>تغيير اسم المجموعة</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            inputProps={{ maxLength: 50 }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameOpen(false)}>إلغاء</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !name.trim()}>
            حفظ
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
