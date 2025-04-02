import { Request, Response } from 'express';
import pool from '../config/db';

// Get all genres
export const getAllGenres = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM genres ORDER BY name');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching genres:', error);
    res.status(500).json({ message: 'Error fetching genres' });
  }
};

// Get genre by ID
export const getGenreById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM genres WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Genre not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get genre error:', error);
    res.status(500).json({ message: 'Error fetching genre' });
  }
};

// Create genre (admin only)
export const createGenre = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;

    // Check if genre already exists
    const existingGenre = await pool.query(
      'SELECT * FROM genres WHERE name = $1',
      [name]
    );
    if (existingGenre.rows.length > 0) {
      res.status(400).json({ message: 'Genre already exists' });
      return;
    }

    const result = await pool.query(
      'INSERT INTO genres (name) VALUES ($1) RETURNING *',
      [name]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create genre error:', error);
    res.status(400).json({ message: 'Error creating genre' });
  }
};

// Update genre (admin only)
export const updateGenre = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Check if genre exists
    const genreCheck = await pool.query(
      'SELECT * FROM genres WHERE id = $1',
      [id]
    );
    if (genreCheck.rows.length === 0) {
      res.status(404).json({ message: 'Genre not found' });
      return;
    }

    // Check if new name already exists
    const existingGenre = await pool.query(
      'SELECT * FROM genres WHERE name = $1 AND id != $2',
      [name, id]
    );
    if (existingGenre.rows.length > 0) {
      res.status(400).json({ message: 'Genre name already exists' });
      return;
    }

    const result = await pool.query(
      'UPDATE genres SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [name, id]
    );

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update genre error:', error);
    res.status(400).json({ message: 'Error updating genre' });
  }
};

// Delete genre (admin only)
export const deleteGenre = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if genre exists and is not used by any books
    const genreCheck = await pool.query(
      'SELECT g.*, COUNT(b.id) as book_count FROM genres g LEFT JOIN books b ON g.id = b.genre_id WHERE g.id = $1 GROUP BY g.id',
      [id]
    );

    if (genreCheck.rows.length === 0) {
      res.status(404).json({ message: 'Genre not found' });
      return;
    }

    if (genreCheck.rows[0].book_count > 0) {
      res.status(400).json({ message: 'Cannot delete genre that has associated books' });
      return;
    }

    const result = await pool.query(
      'DELETE FROM genres WHERE id = $1 RETURNING *',
      [id]
    );

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Delete genre error:', error);
    res.status(400).json({ message: 'Error deleting genre' });
  }
}; 