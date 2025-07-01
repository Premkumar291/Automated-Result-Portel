# Automated College Result Portal

A clean, simple authentication-based web application for college result management.

## Features

- **User Authentication**: Complete signup, login, email verification, and password reset functionality
- **Clean Dashboard**: Simple user interface with account information display
- **Secure Backend**: JWT-based authentication with MongoDB integration
- **Modern Frontend**: React with Tailwind CSS for responsive design

## Project Structure

```
├── backend/
│   ├── controller/
│   │   └── auth.controller.js      # Authentication logic
│   ├── dataBase/
│   │   └── connectDb.js           # MongoDB connection
│   ├── middleware/
│   │   └── verifyToken.js         # JWT verification
│   ├── models/
│   │   └── user.model.js          # User data model
│   ├── routes/
│   │   └── auth.route.js          # Authentication routes
│   ├── utils/                     # Utility functions
│   └── server.js                  # Express server setup
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/              # Login, signup, verification pages
│   │   │   ├── Dashboard/         # Main dashboard component
│   │   │   └── pagenotfound/      # 404 page
│   │   ├── api/                   # API communication
│   │   └── App.jsx                # Main app component
│   └── package.json
└── package.json                   # Root package.json
```

## Technologies Used

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Nodemailer** for email services
- **CORS** for cross-origin requests

### Frontend
- **React 19** with Vite
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API calls
- **Zustand** for state management

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Automated-Result-Portel
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   PORT=8080
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   
   # Email configuration
   EMAIL_USER=your_email
   EMAIL_PASS=your_email_password
   ```

5. **Run the application**
   
   **Development mode (both frontend and backend):**
   ```bash
   # Terminal 1 - Backend
   npm run dev
   
   # Terminal 2 - Frontend
   npm run frontend:dev
   ```
   
   **Production mode:**
   ```bash
   npm start
   ```

## Available Scripts

- `npm start` - Start the backend server
- `npm run dev` - Start backend in development mode with nodemon
- `npm run frontend:dev` - Start frontend development server
- `npm run frontend:build` - Build frontend for production

## API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /signup` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /verify-email` - Email verification
- `POST /forgot-password` - Request password reset
- `POST /reset-password/:token` - Reset password
- `GET /check-auth` - Check authentication status

## Features Overview

### User Authentication System
- Secure user registration with email verification
- Login with JWT token management
- Password reset functionality via email
- Automatic session management

### Dashboard
- Clean, modern interface
- User account information display
- Responsive design for all devices
- Secure logout functionality

## Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- CORS protection
- Email verification requirements
- Secure token management
- Protected routes and middleware

## Development Notes

This is a clean, foundational version of the result portal with all PDF processing functionality removed. The application now focuses on:

1. **Core Authentication**: Robust user management system
2. **Clean Architecture**: Well-organized code structure
3. **Modern Stack**: Latest versions of React, Node.js, and related technologies
4. **Extensibility**: Easy to add new features as needed

## Future Enhancements

The current clean foundation allows for easy addition of:
- Student result management features
- Grade calculation systems
- Report generation
- Administrative panels
- Additional dashboard components

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.
