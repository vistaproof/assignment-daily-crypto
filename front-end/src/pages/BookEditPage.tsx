import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BOOKS } from '../constants/books';
import { Book } from '../types';

const BookEditPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<Partial<Book>>({
    title: '',
    author: '',
    isbn: '',
    publicationYear: undefined,
    genre: '',
    description: '',
    coverImage: ''
  });

  useEffect(() => {
    if (id) {
      const book = BOOKS.find(b => b.id === id);
      if (book) {
        setFormData(book);
      }
    }
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement save/update logic here
    console.log('Save/Update book:', formData);
    navigate('/profile');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Implement image upload logic
      console.log('Image file selected:', file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {isEditing ? 'Edit Book' : 'Add Book'}
      </h1>

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
            className="mt-1 w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-200 focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
            required
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
            className="mt-1 w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-200 focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
            required
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
            className="mt-1 w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-200 focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
          />
        </div>

        <div>
          <label htmlFor="publicationYear" className="block text-sm font-medium text-gray-700">
            Publication Year
          </label>
          <input
            type="number"
            id="publicationYear"
            name="publicationYear"
            value={formData.publicationYear || ''}
            onChange={handleChange}
            className="mt-1 w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-200 focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
          />
        </div>

        <div>
          <label htmlFor="genre" className="block text-sm font-medium text-gray-700">
            Genre
          </label>
          <select
            id="genre"
            name="genre"
            value={formData.genre}
            onChange={handleChange}
            className="mt-1 w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-200 focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
          >
            <option value="">Select Genre</option>
            <option value="Fiction">Fiction</option>
            <option value="Non-Fiction">Non-Fiction</option>
            <option value="Science Fiction">Science Fiction</option>
            <option value="Fantasy">Fantasy</option>
            <option value="Mystery">Mystery</option>
            <option value="Romance">Romance</option>
            <option value="Horror">Horror</option>
            <option value="Biography">Biography</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Cover Image
          </label>
          <div className="mt-1 flex items-center space-x-4">
            {formData.coverImage && (
              <img
                src={formData.coverImage}
                alt="Book cover"
                className="h-32 w-24 object-cover rounded"
              />
            )}
            <label className="cursor-pointer px-4 py-2 text-sm text-purple-600 bg-white border border-purple-600 rounded-md hover:bg-purple-50">
              <span>Upload Image</span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default BookEditPage; 