import { Request, Response } from 'express';
import pool from '../config/db';
import { IAuthRequest } from '../types';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadDir = 'uploads/books';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
    }
  }
});

// Get all books with filters and pagination
export const getAllBooks = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      search,
      author,
      genre,
      user_id,
      sortBy = 'title',
      sortOrder = 'asc',
      page = 1,
      limit = 12
    } = req.query;

    let query = `
      SELECT b.*, g.name as genre_name, u.user_id as creator_id 
      FROM books b 
      LEFT JOIN genres g ON b.genre_id = g.id 
      LEFT JOIN users u ON b.user_id = u.id
      WHERE 1=1
    `;
    const queryParams: any[] = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (LOWER(b.title) LIKE LOWER($${paramCount}) OR LOWER(b.author) LIKE LOWER($${paramCount}))`;
      queryParams.push(`%${search}%`);
      paramCount++;
    }

    if (author) {
      query += ` AND b.author ILIKE $${paramCount}`;
      queryParams.push(`%${author}%`);
      paramCount++;
    }

    if (genre) {
      query += ` AND g.name ILIKE $${paramCount}`;
      queryParams.push(`%${genre}%`);
      paramCount++;
    }

    if (user_id) {
      query += ` AND b.user_id = $${paramCount}`;
      queryParams.push(user_id);
      paramCount++;
    }

    // Add sorting
    query += ` ORDER BY b.${sortBy} ${sortOrder}`;

    // Add pagination
    const offset = (Number(page) - 1) * Number(limit);
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(Number(limit), offset);

    // Get total count
    const countQuery = query.replace('SELECT b.*, g.name as genre_name, u.user_id as creator_id', 'SELECT COUNT(*)')
      .replace('ORDER BY b.title asc', '')
      .replace(`LIMIT $${paramCount} OFFSET $${paramCount + 1}`, '');
    
    const countResult = await pool.query(countQuery, queryParams.slice(0, -2));
    const totalCount = parseInt(countResult.rows[0].count);

    const result = await pool.query(query, queryParams);

    res.status(200).json({
      success: true,
      count: totalCount,
      data: result.rows.map(book => ({
        id: book.id,
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        published_date: book.published_date,
        genre_id: book.genre_id,
        genre_name: book.genre_name,
        user_id: book.user_id,
        creator_id: book.creator_id,
        cover_image: book.cover_image,
        created_at: book.created_at,
        updated_at: book.updated_at
      }))
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ message: 'Error fetching books' });
  }
};

// Get a single book
export const getBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT b.*, g.name as genre_name, u.user_id as creator_id FROM books b LEFT JOIN genres g ON b.genre_id = g.id LEFT JOIN users u ON b.user_id = u.id WHERE b.id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({ message: 'Error fetching book' });
  }
};

// Create a new book
export const createBook = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { title, author, isbn, published_date, genre_id, description, cover_image } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Check if genre exists
    const genreResult = await pool.query(
      'SELECT id FROM genres WHERE id = $1',
      [genre_id]
    );

    if (genreResult.rows.length === 0) {
      res.status(400).json({ message: 'Invalid genre ID' });
      return;
    }

    // Handle base64 image
    let coverImagePath = cover_image;
    if (cover_image) {
      // Validate base64 string
      if (!cover_image.startsWith('data:image/')) {
        res.status(400).json({ message: 'Invalid image format' });
        return;
      }
    }

    // Reset the sequence if needed
    await pool.query('SELECT setval(\'books_id_seq\', (SELECT MAX(id) FROM books), true)');

    const result = await pool.query(
      'INSERT INTO books (title, author, isbn, published_date, genre_id, user_id, description, cover_image) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [title, author, isbn, published_date, genre_id, userId, description, coverImagePath]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create book error:', error);
    res.status(400).json({ message: 'Error creating book' });
  }
};

// Update book
export const updateBook = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, author, isbn, published_date, genre_id, description, cover_image } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Check if book exists and belongs to user
    const bookResult = await pool.query(
      'SELECT * FROM books WHERE id = $1',
      [id]
    );

    if (bookResult.rows.length === 0) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }

    const book = bookResult.rows[0];
    
    // Check if user is the creator of the book
    if (book.user_id !== userId) {
      res.status(403).json({ message: 'Not authorized to update this book' });
      return;
    }

    // Check if genre exists
    const genreResult = await pool.query(
      'SELECT id FROM genres WHERE id = $1',
      [genre_id]
    );

    if (genreResult.rows.length === 0) {
      res.status(400).json({ message: 'Invalid genre ID' });
      return;
    }

    // Handle base64 image
    let coverImagePath = cover_image;
    if (cover_image) {
      // Validate base64 string
      if (!cover_image.startsWith('data:image/')) {
        res.status(400).json({ message: 'Invalid image format' });
        return;
      }
    }

    const result = await pool.query(
      'UPDATE books SET title = $1, author = $2, isbn = $3, published_date = $4, genre_id = $5, description = $6, cover_image = $7, updated_at = CURRENT_TIMESTAMP WHERE id = $8 RETURNING *',
      [title, author, isbn, published_date, genre_id, description, coverImagePath, id]
    );

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update book error:', error);
    res.status(400).json({ message: 'Error updating book' });
  }
};

// Delete book
export const deleteBook = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Check if book exists and belongs to user
    const bookResult = await pool.query(
      'SELECT * FROM books WHERE id = $1',
      [id]
    );

    if (bookResult.rows.length === 0) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }

    const book = bookResult.rows[0];
    
    // Check if user is the creator of the book
    if (book.user_id !== userId) {
      res.status(403).json({ message: 'Not authorized to delete this book' });
      return;
    }

    await pool.query('DELETE FROM books WHERE id = $1', [id]);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({ message: 'Error deleting book' });
  }
};

export const getBooks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      search,
      page = 1,
      limit = 12
    } = req.query;
    
    // Base query parts
    const fromClause = 'FROM books b LEFT JOIN genres g ON b.genre_id = g.id';
    const params: any[] = [];
    let paramCount = 1;
    
    // Build WHERE clause for search
    let whereClause = '';
    if (search) {
      whereClause = ' WHERE LOWER(b.title) LIKE LOWER($1) OR LOWER(b.author) LIKE LOWER($1)';
      params.push(`%${search}%`);
      paramCount++;
    }
    
    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) ${fromClause}${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const totalCount = parseInt(countResult.rows[0].count);
    
    // Build the main query with pagination
    const selectClause = 'SELECT b.*, g.name as genre_name';
    const orderClause = ' ORDER BY b.created_at DESC';
    
    // Add pagination
    const offset = (Number(page) - 1) * Number(limit);
    const paginationClause = ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(Number(limit), offset);
    
    // Combine all parts for the final query
    const mainQuery = `${selectClause} ${fromClause}${whereClause}${orderClause}${paginationClause}`;
    
    // Execute the query
    const result = await pool.query(mainQuery, params);
    
    // Return the results with pagination info
    res.json({ 
      success: true, 
      count: totalCount,
      data: result.rows,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(totalCount / Number(limit))
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch books' });
  }
}; 