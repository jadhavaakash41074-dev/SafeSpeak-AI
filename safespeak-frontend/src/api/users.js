import api from './axios';

export const getUserProfile = (userId)   => api.get(`/users/${userId}`);
export const updateProfile  = (formData) => api.put('/users/me', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const followUser     = (userId)   => api.post(`/users/${userId}/follow`);
export const unfollowUser   = (userId)   => api.delete(`/users/${userId}/follow`);
