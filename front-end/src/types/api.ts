export interface User {
  id: number;
  email: string;
  user_id: string;
  role: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  books: Book[];
}

export interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  isbn: string;
  published_date: string;
  cover_image: string;
  genre_id: number;
  genre_name: string;
  user_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface LoginData {
  user_id?: string;
  email?: string;
  password: string;
}

export interface RegisterData {
  user_id: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface BookFilters {
  search?: string;
  author?: string;
  genre?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface Genre {
  id: number;
  name: string;
} 