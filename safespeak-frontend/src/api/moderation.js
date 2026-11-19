import api from './axios';
import { mockModerate } from './mockData';

const tryBackend = async (apiFn, mockFn) => {
  try {
    return await apiFn();
  } catch (err) {
    if (!err.response) return mockFn();
    throw err;
  }
};

export const moderateComment = (text) =>
  tryBackend(
    () => api.post('/moderation/check', { text }),
    () => mockModerate(text).then((d) => ({ data: d }))
  );
