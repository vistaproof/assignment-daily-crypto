export const API_BASE_URL = 'http://192.168.1.120:5000/api';

export const API_ENDPOINTS = {
  // User endpoints
  REGISTER: '/users/register',
  LOGIN: '/users/login',
  CHANGE_PASSWORD: '/users/change-password',
  FORGOT_PASSWORD: '/users/forgot-password',
  RESET_PASSWORD: '/users/reset-password',
  UPDATE_AVATAR: '/users/avatar',
  GET_PROFILE: '/users/profile',
  
  // Book endpoints
  BOOKS: '/books',
  BOOK_DETAIL: (id: number) => `/books/${id}`,
  GENRES: '/genres',
} as const; 