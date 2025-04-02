import { Request } from 'express';

export interface IAuthRequest extends Request {
  user?: {
    id: number;
  };
}

export interface IGenre {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface IBook {
  id: number;
  title: string;
  author: string;
  isbn: string;
  published_date: Date;
  genre_id: number;
  genre_name?: string;
  user_id?: number;
  creator_id?: string;
  description?: string;
  price?: number;
  cover_image?: string;
  created_at: Date;
  updated_at: Date;
}

export interface IBookQuery {
  search?: string;
  author?: string;
  genre?: string;
  user_id?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface IUser {
  id?: number;
  email: string;
  user_id: string;
  password: string;
  created_at?: Date;
  updated_at?: Date;
  reset_password_token?: string;
  reset_password_expires?: Date;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}
