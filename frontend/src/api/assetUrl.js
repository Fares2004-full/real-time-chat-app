const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export function assetUrl(path) {
  if (!path) return undefined;
  if (/^(https?:|blob:|data:)/.test(path)) return path;
  return `${baseURL}${path}`;
}
