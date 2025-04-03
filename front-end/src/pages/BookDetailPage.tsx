import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { bookService } from '../services/bookService';
import { authService } from '../services/authService';
import { Book, User } from '../types/api';

const BookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Reset scroll position when component mounts
  useEffect(() => {
    // This ensures the page starts at the top when navigating to this page
    window.scrollTo(0, 0);
    
    // Also handle the case when the page is refreshed (F5)
    const handleBeforeUnload = () => {
      // Store the current scroll position in sessionStorage
      sessionStorage.setItem('bookDetailScrollPosition', '0');
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Check if we need to restore scroll position (for page refreshes)
    const savedPosition = sessionStorage.getItem('bookDetailScrollPosition');
    if (savedPosition) {
      window.scrollTo(0, parseInt(savedPosition, 10));
      // Clear the saved position after restoring
      sessionStorage.removeItem('bookDetailScrollPosition');
    }
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    // Get current user
    const user = authService.getUser();
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!id) {
        setError('Book not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await bookService.getBookById(parseInt(id, 10));
        if (response.success && response.data) {
          setBook(response.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch book details');
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [id]);

  const handleDelete = async () => {
    if (!book) return;

    if (!window.confirm('Are you sure you want to delete this book?')) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await bookService.deleteBook(book.id);
      if (response.success) {
        navigate('/profile');
      } else {
        setError(response.message || 'Failed to delete book');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete book');
    } finally {
      setIsDeleting(false);
    }
  };

  // Check if the current user is the owner of the book
  const isBookOwner = currentUser && book && currentUser.id === book.user_id;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Book not found</h1>
          <Link 
            to="/" 
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
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

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:shadow-xl">
          <div className="flex flex-col md:flex-row">
            {/* Cover Image - Full height on mobile, fixed width on desktop */}
            <div className="md:w-1/3 lg:w-1/4 relative group overflow-hidden">
              <div className={`absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 z-10 rounded-l-2xl`}></div>
              <img
                src={book.cover_image || `https://placehold.co/400x400/e2e8f0/1e293b?text=${encodeURIComponent(book.title)}`}
                alt={book.title}
                className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'} rounded-l-2xl`}
                style={{ minHeight: '400px' }}
                onLoad={() => setImageLoaded(true)}
              />
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-l-2xl">
                  <div className="animate-pulse w-full h-full bg-gray-200"></div>
                </div>
              )}
            </div>

            {/* Book Details */}
            <div className="p-8 md:w-2/3 lg:w-3/4">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
                <p className="text-xl text-gray-600 mb-2">{book.author}</p>
                <div className="inline-block px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 rounded-full text-sm font-medium">
                  {book.genre_name}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50/80 backdrop-blur-sm p-4 rounded-lg">
                  <h2 className="text-sm font-medium text-gray-500">ISBN</h2>
                  <p className="mt-1 text-gray-900 font-medium">{book.isbn}</p>
                </div>
                <div className="bg-gray-50/80 backdrop-blur-sm p-4 rounded-lg">
                  <h2 className="text-sm font-medium text-gray-500">Published Date</h2>
                  <p className="mt-1 text-gray-900 font-medium">{new Date(book.published_date).toLocaleDateString()}</p>
                </div>
                <div className="bg-gray-50/80 backdrop-blur-sm p-4 rounded-lg">
                  <h2 className="text-sm font-medium text-gray-500">Added</h2>
                  <p className="mt-1 text-gray-900 font-medium">{book.created_at ? new Date(book.created_at).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="bg-gray-50/80 backdrop-blur-sm p-4 rounded-lg">
                  <h2 className="text-sm font-medium text-gray-500">Last Updated</h2>
                  <p className="mt-1 text-gray-900 font-medium">{book.updated_at ? new Date(book.updated_at).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-3">Description</h2>
                <div className="bg-gray-50/80 backdrop-blur-sm p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{book.description}</p>
                </div>
              </div>

              {isBookOwner && (
                <div className="flex space-x-4">
                  <Link
                    to={`/book_edit/${book.id}`}
                    className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Book
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-pink-600 rounded-lg hover:from-red-700 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {isDeleting ? 'Deleting...' : 'Delete Book'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage; 