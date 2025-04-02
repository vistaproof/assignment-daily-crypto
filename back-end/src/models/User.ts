import bcrypt from 'bcryptjs';
import pool from '../config/db';
import { IUser } from '../types';

export const createUser = async (user: Omit<IUser, 'id' | 'created_at' | 'updated_at'>): Promise<IUser> => {
  const hashedPassword = await bcrypt.hash(user.password, 10);
  const query = `
    INSERT INTO users (email, user_id, password)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const values = [user.email, user.user_id, hashedPassword];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const findUserByEmail = async (email: string): Promise<IUser | null> => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0] || null;
};

export const findUserById = async (id: number): Promise<IUser | null> => {
  const query = 'SELECT * FROM users WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

export const updateUserPassword = async (id: number, password: string): Promise<void> => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const query = 'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
  await pool.query(query, [hashedPassword, id]);
};

export const updateResetPasswordToken = async (email: string, token: string, expires: Date): Promise<void> => {
  const query = `
    UPDATE users 
    SET reset_password_token = $1, reset_password_expires = $2, updated_at = CURRENT_TIMESTAMP 
    WHERE email = $3
  `;
  await pool.query(query, [token, expires, email]);
};

export const findUserByResetToken = async (token: string): Promise<IUser | null> => {
  const query = `
    SELECT * FROM users 
    WHERE reset_password_token = $1 
    AND reset_password_expires > CURRENT_TIMESTAMP
  `;
  const result = await pool.query(query, [token]);
  return result.rows[0] || null;
};

export const comparePassword = async (candidatePassword: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(candidatePassword, hashedPassword);
}; 