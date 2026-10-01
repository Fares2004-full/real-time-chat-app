import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';

// Makes MUI components (Drawer direction, margins, icons...) lay out
// correctly for Arabic instead of just flipping the text direction.
const rtlCache = createCache({
  key: 'mui-rtl',
  stylisPlugins: [prefixer, rtlPlugin]
});

export default rtlCache;
