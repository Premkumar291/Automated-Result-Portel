# 🎓 ACADEX - Automated College Result Portal

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.2-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-19.1.0-61DAFB.svg)

**A comprehensive web-based academic management system for educational institutions**

[Features](#-features) • [Installation](#-installation--setup) • [Documentation](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#️-technology-stack)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Environment Configuration](#-environment-configuration)
- [API Documentation](#-api-documentation)
- [User Roles & Permissions](#-user-roles--permissions)
- [Theme Customization](#-theme-customization)
- [Security](#-security-considerations)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Recent Updates](#-recent-updates)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**ACADEX** is a modern, full-stack academic management platform designed to streamline result processing, faculty management, and administrative tasks for educational institutions. Built with cutting-edge technologies, it offers a secure, scalable, and user-friendly solution for managing academic operations.

### Key Highlights

- 🔐 **Enterprise-Grade Security**: JWT authentication, role-based access control, bcrypt password hashing
- 📊 **Automated Result Processing**: PDF analysis, Excel report generation, GridFS storage
- 🎨 **Modern UI/UX**: React 19, TailwindCSS 4, Framer Motion, customizable theming
- 📱 **Fully Responsive**: Mobile-first design, works seamlessly across all devices
- ⚡ **High Performance**: Vite build tool, optimized bundle sizes, lazy loading
- 🔄 **Real-time Updates**: Hot module replacement, instant feedback

---

## ✨ Features

### 🔐 Authentication & Authorization

- **Multi-Role System**: Admin and Faculty roles with hierarchical permissions
- **JWT Authentication**: Secure token-based auth with access & refresh tokens
- **Password Security**: Bcrypt hashing with configurable salt rounds
- **Session Management**: HTTP-only cookies, secure session handling
- **Protected Routes**: Middleware-based route protection
- **Auto-logout**: Automatic session expiry and token refresh

### 👥 User Management

- **Admin Dashboard**: Centralized control panel with statistics and quick actions
- **Faculty Management**: Complete CRUD operations with academic qualifications
  - Personal information (name, email, phone, address)
  - Academic qualifications and studies
  - Department assignments
  - Employment information
- **Student Management**: Student records with department filtering
- **User Hierarchy**: Admin can create other admins and faculty users
- **Department Organization**: Multi-department support with role-based filtering

### 📊 Result Management

- **PDF Processing**: Automated PDF splitting and analysis using PDF.co API
- **GridFS Storage**: Efficient MongoDB GridFS for large file storage
- **Result Analysis**: Intelligent parsing of PDF result documents
- **Data Extraction**: Automated extraction of student marks and grades
- **Semester Organization**: Multi-semester academic structure
- **Result Validation**: Grade validation with arrear detection

### 📋 Academic Management

- **Subject Management**: Complete subject catalog system
  - Subject codes with auto-uppercase conversion
  - Real-time validation (regex: `/^[A-Z]{2,4}\\d{3,4}[A-Z]?$/`)
  - Credits, department, semester organization
  - Active/inactive status management
  - Visual feedback (✓ for valid, ✗ for invalid codes)
- **Faculty Profiles**: Comprehensive faculty information management
- **Department Structure**: Multi-department support with filtering
- **Semester System**: Flexible semester-based organization

### 📈 Reporting & Analytics

- **Excel Report Generation**: Institutional format reports
  - Dynamic subject columns
  - Editable grade sheets with data validation
  - Professional formatting with borders and colors
  - Multiple sheet types (Summary, Detailed, Analysis)
  - Faculty assignment tracking
- **PDF Analysis Reports**: Automated result extraction and processing
- **Student Performance Analytics**: Comprehensive tracking and metrics
- **Department-wise Reports**: Filtered reporting by department and semester
- **Pass/Fail Statistics**: Automated calculation of pass percentages
- **Export Capabilities**: Download reports in Excel format

### 🎨 Modern UI/UX

- **React 19**: Latest React with concurrent features and automatic batching
- **TailwindCSS 4**: Utility-first CSS with JIT compiler
- **CSS Variable Theming**: Global color customization system
  - 11 color shades (50-950) for precise control
  - One-click theme switching
  - 6 pre-configured color palettes (Teal, Blue, Green, Purple, Slate, Amber)
  - Utility classes: `bg-primary-*`, `text-primary-*`, `border-primary-*`
- **Framer Motion**: Smooth animations and page transitions
- **Responsive Design**: Mobile-first approach, works on all screen sizes
- **Icon Libraries**: Heroicons, Lucide React for modern iconography
- **Toast Notifications**: React Hot Toast for user feedback
- **Loading States**: Skeleton screens and loading indicators

### 🔧 Additional Features

- **Input Validation**: Real-time validation with visual feedback
- **Error Handling**: Comprehensive error handling and user-friendly messages
- **Search & Filter**: Advanced search and filtering capabilities
- **Pagination**: Efficient data pagination for large datasets
- **Modal Dialogs**: Reusable modal components for forms and confirmations
- **File Upload**: Drag-and-drop file upload with progress tracking
- **Data Visualization**: Charts and graphs using Chart.js and Recharts

---

## 🛠️ Technology Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | ≥18.0.0 | Runtime environment |
| **Express.js** | 5.1.0 | Web application framework |
| **MongoDB** | ≥6.0.0 | NoSQL database |
| **Mongoose** | 8.16.2 | MongoDB ODM |
| **JWT** | 9.0.2 | Authentication tokens |
| **Bcrypt.js** | 3.0.2 | Password hashing |
| **ExcelJS** | 4.4.0 | Excel report generation |
| **PDF-lib** | 1.17.1 | PDF manipulation |
| **Multer** | 1.4.4 | File upload handling |
| **GridFS** | 5.0.2 | Large file storage |
| **Helmet.js** | 7.1.0 | Security headers |
| **Express Rate Limit** | 7.1.5 | API rate limiting |
| **CORS** | 2.8.5 | Cross-origin resource sharing |
| **HPP** | 0.2.3 | HTTP parameter pollution protection |
| **Validator.js** | 13.11.0 | Input validation |
| **Nodemailer** | 6.10.1 | Email services |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1.0 | UI library |
| **Vite** | 6.3.5 | Build tool & dev server |
| **TailwindCSS** | 4.1.10 | Utility-first CSS framework |
| **React Router** | 7.6.2 | Client-side routing |
| **Axios** | 1.10.0 | HTTP client |
| **Framer Motion** | 12.23.9 | Animation library |
| **Chart.js** | 4.4.1 | Data visualization |
| **Recharts** | 3.2.0 | React charts |
| **React Hot Toast** | 2.5.2 | Toast notifications |
| **Heroicons** | 2.2.0 | Icon library |
| **Lucide React** | 0.525.0 | Icon library |
| **XLSX** | 0.18.5 | Excel file handling |
| **ESLint** | 9.25.0 | Code linting |

### Python Microservice

| Technology | Purpose |
|------------|---------|
| **Python** | 3.13+ |
| **FastAPI** | Web Framework |
| **Uvicorn** | ASGI Server |
| **pdfplumber** | PDF Data Extraction |
| **Pandas** | Data Processing |

---

## 🚀 Installation & Setup

### Prerequisites

Ensure you have the following installed:

- **Python**: v3.10 or higher ([Download](https://www.python.org/downloads/))
- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **MongoDB**: v6.0.0 or higher ([Download](https://www.mongodb.com/try/download/community))
- **Git**: Latest version ([Download](https://git-scm.com/downloads))

### 1. Python Service Setup (Required for PDF Analysis)

1.  **Navigate to python-service directory**
    ```bash
    cd python-service
    ```

2.  **Install Python dependencies**
    ```bash
    # Make sure to use the '-r' flag
    pip install -r requirements.txt
    ```

3.  **Start the Python Microservice**
    ```bash
    uvicorn main:app --reload --port 8000
    ```
    Service will run on `http://localhost:8000`

### 2. Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Premkumar291/Automated-Result-Portal.git
   cd Automated-Result-Portal/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration (see [Environment Configuration](#-environment-configuration))

4. **Start MongoDB**
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

5. **Start the backend server**
   ```bash
   # Development mode (with hot reload)
   npm run dev
   
   # Production mode
   npm start
   ```

   Server will run on `http://localhost:8080`

### 3. Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```env
   VITE_API_URL=http://localhost:8080/api
   VITE_APP_NAME=ACADEX
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   Application will run on `http://localhost:5173`

5. **Build for production**
   ```bash
   npm run build
   npm run preview  # Preview production build
   ```

---

## 🔧 Environment Configuration

### Backend `.env`

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/acadex-db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-characters
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d

# Email Configuration (for notifications)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# PDF.co API
PDFCO_API_KEY=your-pdfco-api-key-here

# Server Configuration
PORT=5000
NODE_ENV=development

# Security
COOKIE_SECRET=your-cookie-secret-key
```

### Frontend `.env`

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Application Configuration
VITE_APP_NAME=ACADEX
VITE_APP_VERSION=1.0.2
```

### ⚠️ Security Notes

- **Never commit `.env` files** to version control
- Use strong, unique secrets (minimum 32 characters)
- Rotate API keys regularly
- Use environment-specific configurations
- Enable HTTPS in production

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/login` | User login | No |
| POST | `/auth/register` | User registration (Admin only) | Yes (Admin) |
| POST | `/auth/refresh` | Refresh JWT token | No |
| POST | `/auth/logout` | User logout | Yes |
| GET | `/auth/check` | Check authentication status | Yes |

### Admin Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/admin/users` | Get all users (Admin hierarchy) | Yes (Admin) |
| POST | `/admin/users` | Create new admin/faculty user | Yes (Admin) |
| PUT | `/admin/users/:id` | Update user information | Yes (Admin) |
| DELETE | `/admin/users/:id` | Delete user | Yes (Admin) |
| GET | `/admin/statistics` | Get admin statistics | Yes (Admin) |

### Faculty Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/faculty` | Get all faculty members | Yes |
| GET | `/faculty/:id` | Get faculty by ID | Yes |
| POST | `/faculty` | Create new faculty | Yes (Admin) |
| PUT | `/faculty/:id` | Update faculty | Yes (Admin) |
| DELETE | `/faculty/:id` | Delete faculty | Yes (Admin) |
| GET | `/faculty/department/:dept` | Get faculty by department | Yes |

### Subject Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/subjects` | Get all subjects | Yes |
| GET | `/subjects/:id` | Get subject by ID | Yes |
| POST | `/subjects` | Create new subject | Yes (Admin) |
| PUT | `/subjects/:id` | Update subject | Yes (Admin) |
| DELETE | `/subjects/:id` | Delete subject | Yes (Admin) |
| GET | `/subjects/department/:dept` | Get subjects by department | Yes |

### Student Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/students` | Get all students | Yes |
| GET | `/students/:id` | Get student by ID | Yes |
| POST | `/students` | Create new student | Yes (Admin) |
| PUT | `/students/:id` | Update student | Yes (Admin) |
| DELETE | `/students/:id` | Delete student | Yes (Admin) |

### PDF Analysis & Reports

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/pdf/upload` | Upload PDF for processing | Yes (Faculty) |
| POST | `/pdf/analyze` | Analyze PDF document | Yes (Faculty) |
| GET | `/pdf/:id` | Get PDF by ID | Yes |
| DELETE | `/pdf/:id` | Delete PDF | Yes (Faculty) |
| POST | `/reports/generate` | Generate Excel report | Yes (Faculty) |
| GET | `/reports/download/:id` | Download Excel report | Yes |

---

## 👥 User Roles & Permissions

### Admin Role

**Permissions:**
- ✅ Full system access
- ✅ Create/manage other admins and faculty users
- ✅ Manage faculty profiles
- ✅ Manage subjects
- ✅ Manage students
- ✅ View all reports and analytics
- ✅ System configuration
- ✅ User hierarchy management

**Dashboard Features:**
- User creation
- Subject management
- Faculty management
- User management (admin hierarchy)
- System statistics

### Faculty Role

**Permissions:**
- ✅ Upload and analyze PDF results
- ✅ Generate Excel reports
- ✅ View student results
- ✅ Manage assigned subjects
- ✅ View department-specific data
- ❌ Cannot create users
- ❌ Cannot modify system settings

**Dashboard Features:**
- PDF processing
- Result analysis
- Report generation
- Faculty assignment management
- Performance analytics

---

## 🎨 Theme Customization

ACADEX includes a powerful CSS variable theming system that allows you to customize the entire application's color scheme.

### Quick Theme Change

1. Open `frontend/src/index.css`
2. Find the `:root` section (around line 16)
3. Replace hex values with your desired colors
4. Save - changes hot reload instantly!

### Available Color Palettes

#### Current: Amber/Brown (Default)
```css
--primary-900: #78350f;
--primary-800: #92400e;
--primary-700: #b45309;
```

#### Teal (Professional)
```css
--primary-900: #134e4a;
--primary-800: #115e59;
--primary-700: #0f766e;
```

#### Blue (Corporate)
```css
--primary-900: #1e3a8a;
--primary-800: #1e40af;
--primary-700: #1d4ed8;
```

#### Green (Natural)
```css
--primary-900: #14532d;
--primary-800: #166534;
--primary-700: #15803d;
```

#### Purple (Creative)
```css
--primary-900: #581c87;
--primary-800: #6b21a8;
--primary-700: #7e22ce;
```

#### Slate (Minimalist)
```css
--primary-900: #0f172a;
--primary-800: #1e293b;
--primary-700: #334155;
```

### Using Theme Colors in Components

```jsx
// Background colors
<div className="bg-primary-900">Dark background</div>
<div className="bg-primary-100">Light background</div>

// Text colors
<h1 className="text-primary-50">Light text</h1>
<p className="text-primary-900">Dark text</p>

// Borders
<div className="border border-primary-800">Bordered box</div>

// Hover effects
<button className="bg-primary-700 hover:bg-primary-800">
  Hover me
</button>

// Gradients
<div className="bg-gradient-to-r from-primary-700 to-primary-900">
  Gradient background
</div>
```

---

## 🔒 Security Considerations

### Production Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS/TLS certificates
- [ ] Configure proper CORS origins
- [ ] Enable rate limiting
- [ ] Remove all `console.log` statements
- [ ] Use a process manager (PM2, Docker)
- [ ] Configure database connection pooling
- [ ] Set up proper backup strategies
- [ ] Enable MongoDB authentication
- [ ] Configure firewall rules
- [ ] Use environment variables for all secrets
- [ ] Implement logging and monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure CSP headers
- [ ] Enable HSTS

### Security Features

- **Helmet.js**: Security headers (XSS, clickjacking protection)
- **Rate Limiting**: Prevents brute force attacks
- **CORS**: Controlled cross-origin access
- **HPP**: HTTP parameter pollution protection
- **Input Validation**: Sanitization and validation
- **Password Hashing**: Bcrypt with salt rounds
- **JWT**: Secure token-based authentication
- **Session Security**: HTTP-only cookies

---

## 🔄 Recent Updates

### Version 1.0.2 - CSS Variable Theming System (December 2025)
- ✅ **Global CSS Color Variables**: Implemented comprehensive theming system
  - CSS custom properties for all color shades (50-950)
  - Utility classes: `bg-primary-*`, `text-primary-*`, `border-primary-*`
  - One-click theme switching by updating hex values in `index.css`
  - 11+ components migrated to use primary color variables
- ✅ **Ready-to-Use Color Palettes**: Pre-configured themes available
  - Teal (Professional), Blue (Corporate), Green (Natural)
  - Purple (Creative), Slate (Minimalist), Amber (Current)
- ✅ **Theme Customization Guide**: Complete documentation for easy theme changes
- ✅ **Backward Compatible**: Old color classes still work alongside new system

### Version 1.0.1 - Enhanced Features (September 2025)
- ✅ **Fixed Subjects API 500 Error**: Resolved authentication issues and invalid search filters
- ✅ **Enhanced Subject Code Input**: Auto-uppercase conversion with real-time validation
  - Smart input field that converts lowercase to uppercase automatically
  - Real-time validation using regex pattern `/^[A-Z]{2,4}\\d{3,4}[A-Z]?$/`
  - Visual feedback with green checkmarks (✓) for valid codes and red X marks (✗) for invalid
  - Professional monospace font styling for better code readability
- ✅ **Improved User Experience**: Visual feedback with color-coded validation indicators
- ✅ **Architecture Cleanup**: Removed unnecessary faculty-to-subject assignment logic
- ✅ **Department Consistency**: Aligned frontend/backend department configurations
- ✅ **Input Validation**: Real-time regex validation with professional styling

### Version 1.0.0 - Core Implementation
- ✅ Complete faculty management system with academic qualifications
- ✅ Subject management with department-wise organization
- ✅ Student management with CRUD operations
- ✅ PDF processing and analysis using PDF.co API
- ✅ Excel report generation with institutional format
- ✅ Admin hierarchy and user management system
- ✅ Security enhancements and console log cleanup
- ✅ Modern React UI with TailwindCSS and Framer Motion
- ✅ GridFS file storage for PDF documents
- ✅ Production-ready security configurations

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Make your changes**
   - Follow ESLint configuration
   - Write meaningful commit messages
   - Add proper error handling
   - Update documentation
4. **Test thoroughly**
5. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
7. **Open a Pull Request**

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 📞 Support

For support and questions:

- **GitHub Issues**: [Create an issue](https://github.com/Premkumar291/Automated-Result-Portal/issues)
- **Documentation**: Check this README and inline code documentation
- **Email**: Contact the development team

---

<div align="center">

**Made with ❤️ by the ACADEX Team**

[⬆ Back to Top](#-acadex---automated-college-result-portal)

</div>

---

**⚠️ Important**: Always ensure your `.env` file is properly configured and never commit sensitive credentials to version control. Follow the security checklist before deploying to production.