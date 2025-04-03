import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import BookDetailPage from './pages/BookDetailPage';
import BookEditPage from './pages/BookEditPage';
import AddBookPage from './pages/AddBookPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8 pt-20">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<RegisterPage />} />
            <Route path="/security" element={<ChangePasswordPage />} />
            <Route path="/reset" element={<ResetPasswordPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/book/:id" element={<BookDetailPage />} />
            <Route path="/book_edit/:id" element={<BookEditPage />} />
            <Route path="/add_book" element={<AddBookPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
