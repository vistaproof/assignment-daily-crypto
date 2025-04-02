# Book Management API

A RESTful API for managing books, built with Node.js, Express, TypeScript, and MongoDB.

## Features

- User authentication with JWT
- CRUD operations for books
- TypeScript support
- MongoDB integration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd book-management-api
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bookstore
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## API Endpoints

### Public Endpoints

- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get a specific book
- `POST /api/users/register` - Register a new user

### Protected Endpoints (Requires Authentication)

- `POST /api/books` - Create a new book
- `PUT /api/books/:id` - Update a book
- `DELETE /api/books/:id` - Delete a book
- `POST /api/users/change-password` - Change user password

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. To access protected endpoints:

1. Register a user using the `/api/users/register` endpoint
2. Login to get a JWT token
3. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Testing

Run tests using:
```bash
npm test
```

## License

MIT