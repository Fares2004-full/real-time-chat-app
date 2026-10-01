import { createTheme } from '@mui/material/styles';

export function buildTheme(mode = 'light') {
  return createTheme({
    direction: 'rtl',
    palette: {
      mode,
      primary: { main: '#4f46e5' },
      background: { default: mode === 'dark' ? '#121212' : '#f4f5f7' }
    },
    typography: {
      fontFamily: ['Cairo', 'Roboto', 'Arial', 'sans-serif'].join(',')
    },
    shape: { borderRadius: 12 }
  });
}

export default buildTheme('light');
