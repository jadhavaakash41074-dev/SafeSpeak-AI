import api from './axios';

export const getFeed         = (page = 1) => api.get(`/posts/feed?page=${page}`);
export const getUserPosts    = (userId)   => api.get(`/posts/user/${userId}`);
export const createPost      = (formData) => api.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deletePost      = (id)       => api.delete(`/posts/${id}`);
export const likePost        = (id)       => api.post(`/posts/${id}/like`);
export const unlikePost      = (id)       => api.delete(`/posts/${id}/like`);
export const getPostComments = (id)       => api.get(`/posts/${id}/comments`);
export const addComment      = (id, text) => api.post(`/posts/${id}/comments`, { text });
export const deleteComment   = (postId, commentId) => api.delete(`/posts/${postId}/comments/${commentId}`);
