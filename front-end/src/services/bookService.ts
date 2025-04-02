import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import { ApiResponse, Book, BookFilters, Genre } from '../types/api';

class BookService {
  async getGenres(): Promise<ApiResponse<Genre[]>> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GENRES}`);
    const result: ApiResponse<Genre[]> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch genres');
    }

    return result;
  }

  async getBooks(filters?: BookFilters): Promise<ApiResponse<Book[]>> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.BOOKS}?${queryParams}`);
    const result: ApiResponse<Book[]> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch books');
    }

    return result;
  }

  async getBookById(id: number): Promise<ApiResponse<Book>> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.BOOKS}/${id}`);
    const result: ApiResponse<Book> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch book');
    }

    return result;
  }

  async addBook(book: Book): Promise<ApiResponse<Book>> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.BOOKS}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(book)
    });

    const result: ApiResponse<Book> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to add book');
    }

    return result;
  }
}

export const bookService = new BookService(); 