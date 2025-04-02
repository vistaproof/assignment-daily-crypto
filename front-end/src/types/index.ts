export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  isbn?: string;
  publicationYear?: number;
  genre?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  books: Book[];
}

export interface LoginCredentials {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
} 