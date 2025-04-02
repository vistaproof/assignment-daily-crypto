import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { bookService } from '../services/bookService';
import { authService } from '../services/authService';
import { Book } from '../types/api';

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

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(authService.isAuthenticated());
    };

    const fetchBooks = async () => {
      try {
        const response = await bookService.getBooks();
        if (response.success && response.data) {
          setBooks(response.data);
        }
      } catch (err) {
        setError('Failed to load books. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    fetchBooks();
  }, []);

  const handleBookClick = (bookId: number) => {
    navigate('/details', { state: { bookId } });
  };

  // Memoized search function
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    // Check cache first
    if (searchCache[query]) {
      setSearchResults(searchCache[query]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await bookService.getBooks({ search: query });
      if (response.success && response.data) {
        // Cache the results
        searchCache[query] = response.data;
        setSearchResults(response.data);
      }
    } catch (err) {
      setError('Failed to search books. Please try again later.');
    } finally {
      setIsSearching(false);
    }
  }, []);

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
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  const displayedBooks = searchQuery.trim() 
    ? (searchResults.length > 0 ? searchResults : []) 
    : books;

  return (
    <div className="max-w-7xl mx-auto space-y-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Book Haven - Your Digital Library Experience</title>
        <meta name="description" content="Discover and manage your favorite books in our digital library. Join Book Haven for personalized book recommendations and more." />
      </Helmet>

      {/* Hero Section */}
      <div className="text-center py-12 px-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          Your Digital Library Experience
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Discover, collect, and manage your favorite books all in one place
        </p>
        
        {/* Search Box */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto mb-8">
          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden shadow-sm">
            <input
              type="text"
              placeholder="Search by Title or Author..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="flex-1 px-4 py-3 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-3 bg-purple-600 text-white hover:bg-purple-700 transition-colors duration-200"
              disabled={isSearching}
            >
              {isSearching ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </span>
              ) : (
                'Search'
              )}
            </button>
          </div>
        </form>
        
        {!isAuthenticated && (
          <Link
            to="/signup"
            className="inline-block px-8 py-3 text-lg font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors duration-200"
          >
            Get Started
          </Link>
        )}
      </div>

      {/* Book List Section */}
      <div className="space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {searchQuery.trim() ? 'Search Results' : 'Featured Books'}
        </h2>
        {displayedBooks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {displayedBooks.map((book) => (
              <div key={book.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                <button 
                  onClick={() => handleBookClick(book.id)}
                  className="relative pb-[100%] overflow-hidden w-full text-left focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 rounded-t-lg"
                >
                  <img
                    src={`https://placehold.co/400x400/e2e8f0/1e293b?text=${encodeURIComponent(book.title)}`}
                    alt={book.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                  />
                </button>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{book.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{book.author}</p>
                  <p className="text-sm text-gray-500 mb-2">{book.genre_name}</p>
                  <button
                    onClick={() => handleBookClick(book.id)}
                    className="mt-auto text-sm text-purple-600 hover:text-purple-700 font-medium text-left"
                  >
                    Read More
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : searchQuery.trim() && !isSearching ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No books found matching your search.</p>
          </div>
        ) : null}
      </div>

      {/* Newsletter Section */}
      <div className="bg-gray-800 rounded-lg p-8">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h3 className="text-2xl sm:text-3xl font-bold">Subscribe to our newsletter</h3>
          <p className="text-gray-300">
            Get the latest updates about new books and special offers
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <button 
              type="submit"
              className="px-6 py-3 bg-purple-600 rounded-md hover:bg-purple-700 transition-colors duration-200 whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 