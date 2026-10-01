import { Avatar, Badge } from '@mui/material';
import { assetUrl } from '../api/assetUrl';

const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const hue = hash % 360;
  return `hsl(${hue}, 60%, 55%)`;
};

export default function UserAvatar({ name = '?', online, size = 40, src }) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  const avatar = (
    <Avatar
      src={assetUrl(src)}
      sx={{ bgcolor: stringToColor(name), width: size, height: size, fontSize: size / 2 }}
    >
      {!src && initial}
    </Avatar>
  );

  if (online === undefined) return avatar;

  return (
    <Badge
      overlap="circular"
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      variant="dot"
      sx={{
        '& .MuiBadge-dot': {
          bgcolor: online ? '#44b700' : '#bdbdbd',
          boxShadow: '0 0 0 2px #fff',
          width: 11,
          height: 11,
          borderRadius: '50%'
        }
      }}
    >
      {avatar}
    </Badge>
  );
}
