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
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-white hover:text-gray-200 transition-colors duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Edit Book</h1>
            <p className="mt-2 text-gray-600">
              Update the book details below.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
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
                    className="h-32 w-24 object-cover rounded-lg shadow-md"
                  />
                )}
                <label className="cursor-pointer px-4 py-2 text-sm text-purple-600 bg-white border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors duration-200">
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
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-300 shadow-md hover:shadow-lg"
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