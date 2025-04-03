import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { bookService } from '../services/bookService';
import { authService } from '../services/authService';
import { Book } from '../types/api';
import { User } from '../types/api';

// Cache for search results
const searchCache: Record<string, Book[]> = {};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const booksPerPage = 12;

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = authService.isAuthenticated();
      setIsAuthenticated(isAuth);
      if (isAuth) {
        const user = authService.getUser();
        setCurrentUser(user);
      }
    };

    const fetchBooks = async () => {
      try {
        const response = await bookService.getBooks({ 
          page: currentPage,
          limit: booksPerPage
        });
        if (response.success && response.data) {
          setBooks(response.data);
          if (response.count !== undefined) {
            setTotalBooks(response.count);
          }
        }
      } catch (err) {
        setError('Failed to load books. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    fetchBooks();
  }, [currentPage]);

  const handleBookClick = (bookId: number) => {
    navigate(`/book/${bookId}`);
  };

  const handleDeleteBook = async (bookId: number) => {
    if (!window.confirm('Are you sure you want to delete this book?')) {
      return;
    }

    setIsDeleting(bookId);
    setError(null);

    try {
      const response = await bookService.deleteBook(bookId);
      if (response.success) {
        // Refresh the book list
        const updatedBooks = books.filter(book => book.id !== bookId);
        setBooks(updatedBooks);
        
        // Also update search results if the deleted book was in them
        if (searchResults.length > 0) {
          const updatedSearchResults = searchResults.filter(book => book.id !== bookId);
          setSearchResults(updatedSearchResults);
        }
      } else {
        setError(response.message || 'Failed to delete book');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete book');
    } finally {
      setIsDeleting(null);
    }
  };

  // Memoized search function
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await bookService.getBooks({ 
        search: query,
        page: currentPage,
        limit: booksPerPage
      });
      if (response.success && response.data) {
        setSearchResults(response.data);
        if (response.count !== undefined) {
          setTotalBooks(response.count);
        }
      }
    } catch (err) {
      setError('Failed to search books. Please try again later.');
    } finally {
      setIsSearching(false);
    }
  }, [currentPage, booksPerPage]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    // Debounce the search to avoid too many API calls
    setIsSearching(true);
    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 150); // Reduced from 300ms to 150ms for faster response

    return () => clearTimeout(timeoutId);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Determine which books to display
  const booksToDisplay = searchQuery ? searchResults : books;
  const totalPages = Math.ceil(totalBooks / booksPerPage);
  const currentBooks = booksToDisplay;

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl font-medium">Loading your book collection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/" className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Book Collection - Home</title>
        <meta name="description" content="Browse and manage your book collection" />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Your Book Collection
          </h1>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
            Discover, organize, and share your favorite books in one place
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search books by title or author..."
              className="w-full px-6 py-4 rounded-xl border-2 border-indigo-300 shadow-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 focus:ring-offset-0 sm:text-lg transition-all duration-300"
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-indigo-500 hover:text-indigo-700 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Books Grid */}
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              {searchQuery.trim() ? 'Search Results' : 'Featured Books'}
            </h2>
            {isAuthenticated && (
              <Link
                to="/add_book"
                className="px-5 py-2.5 bg-white text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition-colors duration-200 shadow-md hover:shadow-lg flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Book
              </Link>
            )}
          </div>
          
          {currentBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentBooks.map((book) => (
                <div key={book.id} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                  <button 
                    onClick={() => handleBookClick(book.id)}
                    className="relative pb-[100%] overflow-hidden w-full text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-t-xl"
                  >
                    <img
                      src={book.cover_image || `https://placehold.co/400x400/e2e8f0/1e293b?text=${encodeURIComponent(book.title)}`}
                      alt={book.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                  </button>
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 text-lg">{book.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{book.author}</p>
                    <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium mb-3">
                      {book.genre_name}
                    </div>
                    <div className="mt-auto flex space-x-3">
                      <button
                        onClick={() => handleBookClick(book.id)}
                        className="flex-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium text-left"
                      >
                        Read More
                      </button>
                      {isAuthenticated && currentUser && currentUser.id === book.user_id && (
                        <>
                          <Link
                            to={`/book_edit/${book.id}`}
                            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteBook(book.id)}
                            disabled={isDeleting === book.id}
                            className="text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                          >
                            {isDeleting === book.id ? 'Deleting...' : 'Remove'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery.trim() && !isSearching ? (
            <div className="text-center py-12 bg-white bg-opacity-10 backdrop-blur-sm rounded-xl">
              <p className="text-white text-xl">No books found matching your search.</p>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-all duration-300"
              >
                Clear Search
              </button>
            </div>
          ) : null}
        </div>

        {/* Pagination */}
        {booksToDisplay.length > 0 && (
          <div className="mt-8 flex justify-center items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-white bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                  currentPage === page
                    ? 'bg-white text-indigo-600'
                    : 'text-white bg-white/10 hover:bg-white/20'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-white bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        {/* Newsletter Section */}
        <div className="mt-16 bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-8 shadow-xl">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h3 className="text-2xl sm:text-3xl font-bold text-white">Subscribe to our newsletter</h3>
            <p className="text-indigo-100">
              Get the latest updates about new books and special offers
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button 
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 