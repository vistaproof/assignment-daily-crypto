import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookService } from '../services/bookService';
import { authService } from '../services/authService';
import { Book, Genre, User } from '../types/api';

const BookEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    isbn: '',
    published_date: '',
    cover_image: '',
    genre_id: 0
  });

  useEffect(() => {
    // Get current user
    const user = authService.getUser();
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await bookService.getGenres();
        if (response.success && response.data) {
          setGenres(response.data);
        }
      } catch (err) {
        console.error('Error fetching genres:', err);
      }
    };

    const fetchBook = async () => {
      if (!id) {
        setError('Book ID is required');
        setLoading(false);
        return;
      }

      try {
        const response = await bookService.getBookById(parseInt(id, 10));
        if (response.success && response.data) {
          const bookData = response.data;
          
          // Check if the current user is the owner of the book
          if (currentUser && currentUser.id !== bookData.user_id) {
            setError('You do not have permission to edit this book');
            setLoading(false);
            return;
          }
          
          setBook(bookData);
          setFormData({
            title: bookData.title,
            author: bookData.author,
            description: bookData.description,
            isbn: bookData.isbn,
            published_date: bookData.published_date.split('T')[0], // Format date for input
            cover_image: bookData.cover_image || '',
            genre_id: bookData.genre_id
          });
        } else {
          setError(response.message || 'Failed to load book');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load book');
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
    fetchBook();
  }, [id, currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'genre_id' ? parseInt(value, 10) : value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData(prev => ({
        ...prev,
        cover_image: base64String
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!id) {
      setError('Book ID is required');
      setLoading(false);
      return;
    }

    // Check if the current user is the owner of the book
    if (currentUser && book && currentUser.id !== book.user_id) {
      setError('You do not have permission to edit this book');
      setLoading(false);
      return;
    }

    try {
      const response = await bookService.updateBook(parseInt(id, 10), formData);
      if (response.success) {
        setSuccess(true);
        // Navigate back to BookDetailPage after 1 second
        setTimeout(() => {
          navigate(`/book/${id}`);
        }, 1000);
      } else {
        setError(response.message || 'Failed to update book');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update book');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600 mb-4">{error}</h1>
        <button
          onClick={() => navigate(-1)}
          className="text-purple-600 hover:text-purple-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Edit Book</h1>
            <p className="mt-2 text-sm text-gray-600">
              Update the book details below.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">Book updated successfully!</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-100 focus:ring-offset-0 sm:text-sm transition-colors duration-200"
                placeholder="Enter book title"
              />
            </div>
            
            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700">
                Author
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-100 focus:ring-offset-0 sm:text-sm transition-colors duration-200"
                placeholder="Enter author name"
              />
            </div>
            
            <div>
              <label htmlFor="isbn" className="block text-sm font-medium text-gray-700">
                ISBN
              </label>
              <input
                type="text"
                id="isbn"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-100 focus:ring-offset-0 sm:text-sm transition-colors duration-200"
                placeholder="Enter ISBN"
              />
            </div>
            
            <div>
              <label htmlFor="published_date" className="block text-sm font-medium text-gray-700">
                Publication Date
              </label>
              <input
                type="date"
                id="published_date"
                name="published_date"
                value={formData.published_date}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-100 focus:ring-offset-0 sm:text-sm transition-colors duration-200"
              />
            </div>
            
            <div>
              <label htmlFor="genre_id" className="block text-sm font-medium text-gray-700">
                Genre
              </label>
              <select
                id="genre_id"
                name="genre_id"
                value={formData.genre_id}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-100 focus:ring-offset-0 sm:text-sm transition-colors duration-200"
              >
                {genres.map(genre => (
                  <option key={genre.id} value={genre.id}>
                    {genre.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                required
                className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-100 focus:ring-offset-0 sm:text-sm transition-colors duration-200"
                placeholder="Enter book description"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cover Image
              </label>
              <div className="mt-1 flex items-center space-x-4">
                {formData.cover_image && (
                  <img
                    src={formData.cover_image}
                    alt="Book cover"
                    className="h-32 w-24 object-cover rounded"
                  />
                )}
                <label className="cursor-pointer px-4 py-2 text-sm text-purple-600 bg-white border border-purple-600 rounded-md hover:bg-purple-50">
                  <span>{loading ? 'Uploading...' : 'Upload Image'}</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={loading}
                  />
                </label>
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Book'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookEditPage; 