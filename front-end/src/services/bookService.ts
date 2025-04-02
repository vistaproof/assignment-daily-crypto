import { API_ENDPOINTS } from '../config/api';
import { ApiResponse, Book, Genre } from '../types/api';
import { api } from '../services/api';

class BookService {
  async getGenres(): Promise<ApiResponse<Genre[]>> {
    try {
      const response = await api.get(API_ENDPOINTS.GENRES);
      return response.data as ApiResponse<Genre[]>;
    } catch (error) {
      console.error('Error fetching genres:', error);
      throw error;
    }
  }

  async getBooks(params?: { search?: string }): Promise<ApiResponse<Book[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) {
        queryParams.append('search', params.search);
      }
      const response = await api.get(`${API_ENDPOINTS.BOOKS}?${queryParams.toString()}`);
      return response.data as ApiResponse<Book[]>;
    } catch (error) {
      console.error('Error fetching books:', error);
      throw error;
    }
  }

  async getBookById(id: number): Promise<ApiResponse<Book>> {
    try {
      const response = await api.get(`${API_ENDPOINTS.BOOKS}/${id}`);
      return response.data as ApiResponse<Book>;
    } catch (error) {
      console.error('Error fetching book:', error);
      throw error;
    }
  }

  async addBook(book: Omit<Book, 'id'>): Promise<ApiResponse<Book>> {
    try {
      const response = await api.post(API_ENDPOINTS.BOOKS, book);
      return response.data as ApiResponse<Book>;
    } catch (error) {
      console.error('Error adding book:', error);
      throw error;
    }
  }
}

export const bookService = new BookService(); 