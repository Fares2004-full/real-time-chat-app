import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const http = axios.create({ baseURL: `${baseURL}/api` });


http.interceptors.request.use((config) => {
  const userId = localStorage.getItem('guestUserId');
  if (userId) config.headers['x-user-id'] = userId;
  return config;
});

export default http;
