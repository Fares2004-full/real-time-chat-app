import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Avatar,
  IconButton,
  Switch,
  FormControlLabel
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { useUser } from '../context/UserContext';
import { assetUrl } from '../api/assetUrl';

export default function ProfileDialog({ open, onClose }) {
  const { user, updateProfile } = useUser();
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(user?.avatar || '');
  const [darkMode, setDarkMode] = useState(user?.theme === 'dark');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    const trimmed = nickname.trim();
    if (!trimmed) {
      setError('الاسم لا يمكن أن يكون فارغًا');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await updateProfile({
        nickname: trimmed,
        theme: darkMode ? 'dark' : 'light',
        avatarFile: avatarFile || undefined
      });
      onClose();
    } catch {
      setError('حدث خطأ أثناء الحفظ، حاول تاني');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>الملف الشخصي</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, pt: 1 }}>
        <Box sx={{ position: 'relative' }}>
          <Avatar src={assetUrl(preview)} sx={{ width: 84, height: 84, fontSize: 32 }}>
            {!preview && nickname.trim().charAt(0).toUpperCase()}
          </Avatar>
          <IconButton
            component="label"
            size="small"
            sx={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <PhotoCameraIcon fontSize="small" />
            <input hidden type="file" accept="image/*" onChange={handleFileChange} />
          </IconButton>
        </Box>

        <TextField
          fullWidth
          label="الاسم"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          inputProps={{ maxLength: 30 }}
          error={!!error}
          helperText={error}
        />

        <FormControlLabel
          sx={{ alignSelf: 'flex-start', m: 0 }}
          control={<Switch checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />}
          label="الوضع الداكن"
        />

      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>إلغاء</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'جاري الحفظ...' : 'حفظ'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
