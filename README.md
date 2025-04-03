# Book Collection Application

A full-stack application for managing a book collection, built with React, TypeScript, Express, and PostgreSQL.

## Features

- User authentication (login/register)
- Book management (add, edit, delete)
- Search functionality with pagination
- Responsive design
- Genre categorization

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL database

## Project Structure

```
/
├── front-end/         # React frontend application
├── back-end/          # Express backend API
└── README.md          # This file
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd back-end
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the back-end directory with the following variables:
   ```
   PORT=5000
   DB_HOST=localhost
   DB_USER=your_postgres_username
   DB_PASSWORD=your_postgres_password
   DB_NAME=book_collection
   JWT_SECRET=your_jwt_secret
   ```

4. Set up the PostgreSQL database:
   - Create a database named `book_collection`
   - The tables will be created automatically when the application starts

5. Start the backend server:
   ```
   npm start
   ```
   or for development with auto-reload:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd front-end
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the front-end directory with the following variables:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. Start the frontend development server:
   ```
   npm start
   ```

## Running the Application

1. Make sure both the backend and frontend servers are running
2. Open your browser and navigate to `http://localhost:3000`
3. Register a new account or log in with existing credentials
4. Start managing your book collection!

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user information

### Books
- `GET /api/books` - Get all books (with pagination and search)
- `GET /api/books/:id` - Get a specific book
- `POST /api/books` - Create a new book
- `PUT /api/books/:id` - Update a book
- `DELETE /api/books/:id` - Delete a book

### Genres
- `GET /api/genres` - Get all genres

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT

## Troubleshooting

- If you encounter database connection issues, make sure PostgreSQL is running and the credentials in the `.env` file are correct.
- If the frontend can't connect to the backend, check that both servers are running and the API URL in the frontend `.env` file is correct.
- For any other issues, check the console logs in both the frontend and backend terminals.

## License

This project is licensed under the MIT License.