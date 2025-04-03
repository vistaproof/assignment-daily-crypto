import { API_ENDPOINTS } from '../config/api';
import { ApiResponse, Book, Genre } from '../types/api';
import { api } from '../services/api';

class BookService {
  async getGenres(): Promise<ApiResponse<Genre[]>> {
    try {
      const response = await api.get(API_ENDPOINTS.GENRES);
      return {
        success: true,
        data: response.data as Genre[]
      };
    } catch (error) {
      console.error('Error fetching genres:', error);
      throw error;
    }
  }

  async getBooks(params?: { search?: string; page?: number; limit?: number }): Promise<ApiResponse<Book[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) {
        queryParams.append('search', params.search);
      }
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
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
      const response = await api.get<ApiResponse<Book>>(API_ENDPOINTS.BOOK_DETAIL(id));
      return response.data;
    } catch (error) {
      console.error('Error fetching book:', error);
      throw error;
    }
  }

  async createBook(book: Omit<Book, 'id'>): Promise<ApiResponse<Book>> {
    try {
      const response = await api.post(API_ENDPOINTS.BOOKS, book);
      return response.data as ApiResponse<Book>;
    } catch (error) {
      console.error('Error creating book:', error);
      throw error;
    }
  }

  async updateBook(id: number, book: Partial<Book>): Promise<ApiResponse<Book>> {
    try {
      const response = await api.put(`${API_ENDPOINTS.BOOKS}/${id}`, book);
      return response.data as ApiResponse<Book>;
    } catch (error) {
      console.error('Error updating book:', error);
      throw error;
    }
  }

  async deleteBook(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`${API_ENDPOINTS.BOOKS}/${id}`);
      return response.data as ApiResponse<void>;
    } catch (error) {
      console.error('Error deleting book:', error);
      throw error;
    }
  }
}

export const bookService = new BookService(); 