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

      console.log('Fetching book details for ID:', id); // Debug log
      try {
        const response = await bookService.getBookById(parseInt(id, 10));
        console.log('Book details response:', response); // Debug log
        if (response.success && response.data) {
          console.log('Setting book data:', response.data); // Debug log
          setBook(response.data);
        } else {
          console.error('Failed to load book details:', response.message); // Debug log
          setError(response.message || 'Failed to load book details');
        }
      } catch (err) {
        console.error('Error fetching book details:', err); // Debug log
        setError('Failed to load book details. Please try again later.');
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Book not found</h1>
        <Link to="/" className="text-purple-600 hover:text-purple-700">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="md:flex-shrink-0">
            <img
              src={book.cover_image || `https://placehold.co/400x400/e2e8f0/1e293b?text=${encodeURIComponent(book.title)}`}
              alt={book.title}
              className="h-96 w-full object-cover md:w-96"
            />
          </div>
          <div className="p-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
              <p className="text-xl text-gray-600 mb-4">{book.author}</p>
            </div>
            
            <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              <div>
                <h2 className="text-sm font-medium text-gray-500">Author</h2>
                <p className="mt-1 text-gray-900">{book.author}</p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500">Genre</h2>
                <p className="mt-1 text-gray-900">{book.genre_name}</p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500">ISBN</h2>
                <p className="mt-1 text-gray-900">{book.isbn}</p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500">Published Date</h2>
                <p className="mt-1 text-gray-900">{new Date(book.published_date).toLocaleDateString()}</p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500">Created At</h2>
                <p className="mt-1 text-gray-900">{book.created_at ? new Date(book.created_at).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500">Updated At</h2>
                <p className="mt-1 text-gray-900">{book.updated_at ? new Date(book.updated_at).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-sm font-medium text-gray-500">Description</h2>
              <p className="mt-1 text-gray-900">{book.description}</p>
            </div>

            {isBookOwner && (
              <div className="mt-6 flex space-x-4">
                <Link
                  to={`/book_edit/${book.id}`}
                  className="px-4 py-2 text-sm text-purple-600 border border-purple-600 rounded-md hover:bg-purple-50"
                >
                  Edit Book
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded-md hover:bg-red-50 disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Book'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage; 