import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { User } from '../types/api';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User>({
    id: 0,
    user_id: '',
    email: '',
    role: 'user',
    avatar_url: 'https://placehold.co/400x400/e2e8f0/1e293b?text=Avatar',
    created_at: '',
    updated_at: '',
    books: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await authService.getUserProfile();
        if (response.success && response.data) {
          setUser(response.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const validateImage = (file: File): boolean => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return false;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return false;
    }

    return true;
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateImage(file)) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
          console.log('Sending avatar update request...'); // Debug log
          const response = await authService.updateAvatar({
            avatar_url: base64String
          });
          console.log('Avatar update response:', response); // Debug log
          
          if (response.success && response.data) {
            setUser(response.data as User);
            setSuccess(true);
          } else {
            setError(response.message || 'Failed to update avatar');
          }
        } catch (err) {
          console.error('Avatar update error:', err); // Debug log
          setError(err instanceof Error ? err.message : 'Failed to update avatar');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File processing error:', err); // Debug log
      setError('Failed to process image file');
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

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-purple-600 mb-8">My Profile</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-start space-x-6">
          <div className="relative group">
            <img
              src={user.avatar_url}
              alt="Profile"
              className="w-32 h-32 rounded-lg object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <label className="cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={loading}
                />
                <span className="text-white text-sm">
                  {loading ? 'Updating...' : 'Change Avatar'}
                </span>
              </label>
            </div>
          </div>

          <div className="flex-1">
            <div className="mb-4">
              <p className="text-sm text-gray-500">Username</p>
              <p className="text-lg">{user.user_id}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-lg">{user.email}</p>
            </div>
            <Link
              to="/security"
              className="inline-block px-4 py-2 text-sm text-purple-600 border border-purple-600 rounded-md hover:bg-purple-50"
            >
              Change Password
            </Link>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">Avatar updated successfully!</p>
          </div>
        )}
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Book Collection</h2>
          <Link
            to="/add_book"
            className="px-4 py-2 text-sm text-white bg-purple-600 rounded-md hover:bg-purple-700"
          >
            Add Book
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {user.books?.map((book) => (
            <div key={book.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={book.cover_image}
                alt={book.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{book.title}</h3>
                <p className="text-sm text-gray-600">{book.author}</p>
                <p className="text-sm text-gray-500 mt-1">{book.genre_name}</p>
                <div className="mt-4 flex space-x-2">
                  <Link
                    to={`/book_edit/${book.id}`}
                    className="flex-1 px-3 py-1 text-sm text-center text-purple-600 border border-purple-600 rounded hover:bg-purple-50"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => console.log('Remove book:', book.id)}
                    className="flex-1 px-3 py-1 text-sm text-center text-red-600 border border-red-600 rounded hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 