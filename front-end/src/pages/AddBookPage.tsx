import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookService } from '../services/bookService';
import { Book, Genre } from '../types/api';

interface FormData {
  title: string;
  author: string;
  description: string;
  isbn: string;
  published_date: string;
  cover_image: string;
  genre_id: number;
  genre_name: string;
}

const initialForm: FormData = {
  title: '',
  author: '',
  description: '',
  isbn: '',
  published_date: '',
  cover_image: '',
  genre_id: 0,
  genre_name: ''
};

const AddBookPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [formData, setFormData] = useState<FormData>(initialForm);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await bookService.getGenres();
        if (response.success && response.data) {
          setGenres(response.data);
          // Set initial genre if available
          if (response.data.length > 0) {
            setFormData(prev => ({
              ...prev,
              genre_id: (response.data as Genre[])[0].id,
              genre_name: (response.data as Genre[])[0].name
            }));
          }
        }
      } catch (err) {
        console.error('Error fetching genres:', err);
      }
    };

    fetchGenres();
  }, []);

  const validateImage = (file: File): boolean => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return false;
    }

    return true;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateImage(file)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({
          ...prev,
          cover_image: base64String
        }));
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to process image file');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await bookService.createBook(formData);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      } else {
        setError(response.message || 'Failed to add book');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add book');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'genre_name') {
      const selectedGenre = genres.find(genre => genre.name === value);
      if (selectedGenre) {
        setFormData(prev => ({
          ...prev,
          genre_id: selectedGenre.id,
          genre_name: selectedGenre.name
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-purple-600 hover:text-purple-700"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Add New Book</h1>
            <p className="mt-2 text-sm text-gray-600">
              Fill in the details below to add a new book to your collection.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">Book added successfully!</p>
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
              <label htmlFor="genre_name" className="block text-sm font-medium text-gray-700">
                Genre
              </label>
              <select
                id="genre_name"
                name="genre_name"
                value={formData.genre_name}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-100 focus:ring-offset-0 sm:text-sm transition-colors duration-200"
              >
                {genres.map((genre) => (
                  <option key={genre.id} value={genre.name}>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Book'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBookPage; 