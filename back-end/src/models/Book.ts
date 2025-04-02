import pool from '../config/db';
import { IBook } from '../types';

export const createBook = async (book: Omit<IBook, 'id' | 'created_at' | 'updated_at'>): Promise<IBook> => {
  const query = `
    INSERT INTO books (title, author, isbn, published_date, genre_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const values = [book.title, book.author, book.isbn, book.published_date, book.genre_id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const findBookById = async (id: number): Promise<IBook | null> => {
  const query = 'SELECT * FROM books WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

export const findBooks = async (query: string = ''): Promise<IBook[]> => {
  const sql = `
    SELECT * FROM books 
    WHERE title ILIKE $1 OR author ILIKE $1
    ORDER BY created_at DESC
  `;
  const result = await pool.query(sql, [`%${query}%`]);
  return result.rows;
};

export const updateBook = async (id: number, book: Partial<IBook>): Promise<IBook | null> => {
  const setClause = Object.keys(book)
    .map((key, index) => `${key} = $${index + 2}`)
    .join(', ');
  
  const query = `
    UPDATE books 
    SET ${setClause}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;
  const values = [id, ...Object.values(book)];
  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

export const deleteBook = async (id: number): Promise<boolean> => {
  const query = 'DELETE FROM books WHERE id = $1 RETURNING id';
  const result = await pool.query(query, [id]);
  return result.rowCount !== null && result.rowCount > 0;
}; 