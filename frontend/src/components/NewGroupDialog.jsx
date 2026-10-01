import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Autocomplete,
  Chip,
  CircularProgress,
  Box
} from '@mui/material';
import http from '../api/http';

export default function NewGroupDialog({ open, onClose, onCreateGroup }) {
  const [name, setName] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName('');
    setSelected([]);
    (async () => {
      setLoadingUsers(true);
      try {
        const { data } = await http.get('/users/search', { params: { q: '' } });
        setAllUsers(data);
      } finally {
        setLoadingUsers(false);
      }
    })();
  }, [open]);

  const handleCreate = async () => {
    if (!name.trim() || selected.length === 0) return;
    setCreating(true);
    try {
      await onCreateGroup(
        name.trim(),
        selected.map((u) => u.userId)
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>إنشاء مجموعة جديدة</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          autoFocus
          label="اسم المجموعة"
          value={name}
          onChange={(e) => setName(e.target.value)}
          inputProps={{ maxLength: 50 }}
          sx={{ mt: 1, mb: 2 }}
        />
        <Autocomplete
          multiple
          options={allUsers}
          loading={loadingUsers}
          getOptionLabel={(u) => u.nickname}
          isOptionEqualToValue={(a, b) => a.userId === b.userId}
          value={selected}
          onChange={(_, value) => setSelected(value)}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip label={option.nickname} {...getTagProps({ index })} key={option.userId} />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="أعضاء المجموعة"
              placeholder="اختر مستخدمين"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loadingUsers ? <CircularProgress size={18} /> : null}
                    {params.InputProps?.endAdornment}
                  </>
                )
              }}
            />
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>إلغاء</Button>
        <Box sx={{ flex: 1 }} />
        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={!name.trim() || selected.length === 0 || creating}
        >
          {creating ? <CircularProgress size={20} color="inherit" /> : 'إنشاء'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
