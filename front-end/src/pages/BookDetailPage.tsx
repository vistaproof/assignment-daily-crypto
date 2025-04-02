import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { bookService } from '../services/bookService';
import { Book } from '../types/api';

const BookDetailPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bookId = location.state?.bookId;

  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!bookId) {
        setError('Book not found');
        setLoading(false);
        return;
      }

      try {
        const response = await bookService.getBookById(bookId);
        if (response.success && response.data) {
          setBook(response.data);
        } else {
          setError('Failed to load book details');
        }
      } catch (err) {
        setError('Failed to load book details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [bookId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
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
              src={`https://placehold.co/400x400/e2e8f0/1e293b?text=${encodeURIComponent(book.title)}`}
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
                <h2 className="text-sm font-medium text-gray-500">Created At</h2>
                <p className="mt-1 text-gray-900">{new Date(book.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500">Updated At</h2>
                <p className="mt-1 text-gray-900">{new Date(book.updated_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage; 