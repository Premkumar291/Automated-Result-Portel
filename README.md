# Automated College Result Portal

This project consists of a frontend and backend component designed to manage college results efficiently. Below are the key details for each section.

## Backend

### Technologies Used
- Node.js
- Express
- MongoDB
- Mongoose (for data modeling)
- JWT (for authentication)

### Key Features
- **Authentication & Authorization**: Secure login and role-based access control (Admin and Faculty).
- **PDF Processing**: Handles PDF uploads, splits them into sections, and stores them in MongoDB.
- **Enhanced Error Handling**: Comprehensive error messages and logging.

### Structure
- **Controller**: Contains business logic.
- **Database**: Connection setup.
- **Middleware**: Authentication functions.
- **Models**: Schema definitions.
- **Routes**: API endpoints.
- **Utils**: Helper functions.

### Running the Backend
- Install dependencies: `npm install`
- Run development server: `npm run dev`
- Start server: `npm start`
- Ensure MongoDB is running and `.env` is configured.

## Frontend

### Technologies Used
- React
- Vite
- TailwindCSS
- React-Router

### Key Features
- **Responsive Design**: Built with TailwindCSS.
- **Dynamic Transitions**: Use of Framer Motion for animations.
- **API Integration**: Interacts with backend services for authentication and PDF analysis.

### Structure
- **Components**: UI elements.
- **API**: Axios instances for backend communication.
- **Styles**: TailwindCSS configuration.

### Running the Frontend
- Install dependencies: `npm install`
- Run development server: `npm run dev`

## Project Setup
1. Clone this repository.
2. Navigate to backend and frontend directories to install dependencies.
3. Set up `.env` files in both directories as needed.
4. Start both backend and frontend servers.

## External API
Integration with **PDF.co** is set for enhanced PDF analysis.

Refer to the documentation folders for more detailed insights.

# Backend Documentation for Automated Result Portal

This documentation provides a detailed overview of the backend structure, routes, and functions for the Automated Result Portal application.

## Project Structure

The backend is organized into the following main directories:

- **controller/**: Contains the business logic for handling requests
- **dataBase/**: Database connection configuration
- **middleware/**: Authentication and request processing middleware
- **models/**: Mongoose schemas for data modeling
- **routes/**: API route definitions
- **services/**: External service integrations
- **utils/**: Utility functions

## Server Configuration

The main server file (`server.js`) sets up an Express application with the following configurations:

- JSON body parsing with 50MB limit
- Cookie parsing for authentication
- CORS configuration for frontend access
- In-memory session storage (recommended to use Redis in production)
- Scheduled cleanup for expired PDFs every 30 minutes

## Role-Based Authentication

The application implements a role-based access control (RBAC) system with two main roles:

### User Roles
- **Faculty**: Default role for teaching staff
- **Admin**: Administrative role with extended privileges

### Authentication Features
- Role validation during signup and login
- Role-based route protection
- Separate dashboards for faculty and admin users
- Comprehensive error handling and logging

### Authentication Middleware

Three levels of authentication middleware are provided:

1. **verifyToken**: Basic authentication check
   - Validates JWT token
   - Extracts user information and role
   - Required for all protected routes

2. **verifyAdmin**: Admin-only route protection
   - Requires valid JWT token
   - Checks for admin role
   - Guards admin-specific functionalities

3. **verifyFaculty**: Faculty route protection
   - Requires valid JWT token
   - Checks for faculty role
   - Guards faculty-specific functionalities

### Error Handling
- Comprehensive error messages
- Role-specific access denial messages
- Detailed console logging for debugging
- Environment-based error detail exposure

## API Routes

### Base Route

- **GET /** - Simple health check endpoint that returns "Server Started successfully!"

### Authentication Routes (`/api/auth`)

- **GET /check-auth** - Verifies if a user is authenticated (requires token)
- **POST /signup** - Creates a new user account
- **POST /login** - Authenticates a user and returns a JWT token
- **POST /logout** - Clears authentication cookies
- **POST /verify-email** - Verifies a user's email with a verification code
- **POST /resend-verification-code** - Resends a new verification code to user's email
- **POST /forgot-password** - Sends a password reset token to the user's email
- **POST /verify-reset-token** - Verifies a password reset token
- **POST /reset-password** - Resets a user's password with a valid token

### PDF Management Routes (`/api/pdf`)

- **POST /split** - Uploads and splits a PDF into semester-wise sections
- **GET /recent** - Gets the most recently uploaded PDFs
- **GET /:uploadId** - Gets all semester PDFs for a specific upload
- **GET /view/:id** - Downloads a specific semester PDF by ID
- **GET /:uploadId/:semester** - Downloads a specific semester PDF by upload name and semester
- **DELETE /:uploadId** - Deletes all semester PDFs for a specific upload

### Student Routes (`/api/student`)

- **GET /departments**: Retrieves all departments with student counts (requires token)
- **GET /search**: Searches students by name with optional department filtering (requires token)
  - Params: `name`, optional `department`
- **GET /department/:department**: Retrieves students in a specified department (requires token)
  - Params: `department`
- **GET /register/:registerNumber**: Retrieves a student by register number (requires token)
  - Params: `registerNumber`
- **POST /**: Creates a new student (Admin only)
- **PUT /:id**: Updates a student's information (Admin only)
  - Params: `id`
- **DELETE /:id**: Deletes a student (Admin only)
  - Params: `id`

### PDF Analysis Routes (`/api/analyze`)

- **GET /upload/:id** - Analyzes a PDF using PDF.co API (supports optional page parameter)

## Controllers

### Authentication Controller (`auth.controller.js`)

#### `signup`
- **Purpose**: Registers a new user
- **Process**:
  1. Validates required fields (email, password, name, department)
  2. Checks if user already exists
  3. Hashes password using bcrypt
  4. Generates verification token
  5. Creates new user in database
  6. Sends verification email
  7. Generates JWT token and sets cookies
  8. Returns user data (excluding password)

#### `verifyEmail`
- **Purpose**: Verifies a user's email address with enhanced expired code handling
- **Process**:
  1. Validates verification code
  2. Finds user with matching code that hasn't expired
  3. If code is expired, automatically generates a new code and sends email
  4. Marks user as verified if code is valid
  5. Sends confirmation email
  6. Returns user data with role information for proper redirection
- **Enhanced Features**:
  - Automatic handling of expired verification codes
  - Seamless code regeneration and resending
  - Role-based response for frontend redirection

#### `resendVerificationCode`
- **Purpose**: Generates and sends a new verification code to user's email
- **Process**:
  1. Validates user email
  2. Checks if user exists and is not already verified
  3. Generates new verification token with 10-minute expiry
  4. Sends new verification email
  5. Returns success confirmation
- **Use Cases**:
  - Manual resend requests from users
  - Automatic resend when user visits verification page
  - Recovery from expired or lost verification codes

#### `login`
- **Purpose**: Authenticates a user
- **Process**:
  1. Validates email and password
  2. Finds user in database
  3. Compares password with stored hash
  4. Checks if user is verified
  5. Generates JWT token and sets cookies
  6. Updates last login timestamp
  7. Returns user data

#### `logout`
- **Purpose**: Logs out a user
- **Process**: Clears authentication cookies

#### `forgotPassword`
- **Purpose**: Initiates password reset process
- **Process**:
  1. Validates email
  2. Finds user in database
  3. Generates reset token
  4. Sends reset email

#### `verifyResetToken`
- **Purpose**: Verifies a password reset token
- **Process**:
  1. Validates email and code
  2. Finds user with matching code that hasn't expired

#### `resetPassword`
- **Purpose**: Resets a user's password
- **Process**:
  1. Validates email, code, and new password
  2. Finds user with matching code that hasn't expired
  3. Hashes new password
  4. Updates user's password
  5. Clears reset token

#### `checkAuth`
- **Purpose**: Verifies if a user is authenticated
- **Process**:
  1. Extracts user ID from request
  2. Finds user in database
  3. Returns user data if found

### GridFS PDF Split Controller (`gridFSPdfSplit.controller.js`)

#### `uploadAndSplitPDF`
- **Purpose**: Uploads and splits a PDF into semester-wise sections
- **Process**:
  1. Validates uploaded file
  2. Creates unique upload name
  3. Deletes any existing PDFs with the same name
  4. Extracts text from each page
  5. Identifies semester markers in the text
  6. Groups pages by semester
  7. Saves each semester group as a separate PDF in GridFS
  8. Creates metadata records for each PDF
  9. Sets auto-delete time

#### `getSemesterPDFs`
- **Purpose**: Gets all semester PDFs for a specific upload
- **Process**:
  1. Finds all PDFs with matching upload name
  2. Returns metadata for each PDF

#### `downloadSemesterPDFById`
- **Purpose**: Downloads a specific semester PDF by ID
- **Process**:
  1. Finds PDF metadata by ID
  2. Streams the PDF from GridFS to the response

#### `downloadSemesterPDF`
- **Purpose**: Downloads a specific semester PDF by upload name and semester
- **Process**:
  1. Finds PDF metadata by upload name and semester
  2. Streams the PDF from GridFS to the response

#### `deleteSemesterPDFs`
- **Purpose**: Deletes all semester PDFs for a specific upload
- **Process**:
  1. Finds all PDFs with matching upload name
  2. Deletes each file from GridFS
  3. Deletes all metadata records

#### `getRecentPDFs`
- **Purpose**: Gets the most recently uploaded PDFs
- **Process**:
  1. Finds the most recent upload
  2. Gets all PDFs for that upload
  3. Returns metadata for each PDF

### PDF.co Analysis Controller (`pdfCoAnalysis.controller.js`)

#### `analyzePDFWithPdfCo`
- **Purpose**: Analyzes a PDF using PDF.co API
- **Process**:
  1. Finds PDF metadata by ID
  2. Retrieves PDF from GridFS
  3. Extracts specific page if requested
  4. Uploads PDF to PDF.co
  5. Converts PDF to CSV using PDF.co
  6. Parses CSV to structured JSON
  7. Returns analysis results

### Student Controller (`controller/Admin/student.controller.js`)

#### `createStudent`
- **Purpose**: Creates a new student record
- **Process**:
  1. Validates required fields (email, registerNumber, name, department, etc.)
  2. Checks for duplicate email, register number, or mobile number
  3. Creates new student in database
  4. Returns created student data

#### `getStudentsByDepartment`
- **Purpose**: Retrieves students filtered by department
- **Process**:
  1. Validates department parameter
  2. Queries students by department with pagination
  3. Returns student list with pagination info
  4. Sorted alphabetically by name

#### `searchStudentsByName`
- **Purpose**: Searches students by name with optional department filtering
- **Process**:
  1. Validates search query (minimum 2 characters)
  2. Performs case-insensitive name search
  3. Applies department filter if provided
  4. Returns matching students with pagination

#### `getDepartments`
- **Purpose**: Retrieves all departments with student counts
- **Process**:
  1. Aggregates student data by department
  2. Counts students in each department
  3. Returns department list with counts

#### `getStudentByRegNumber`
- **Purpose**: Finds a student by register number
- **Process**:
  1. Searches for student with matching register number
  2. Returns student data if found
  3. Case-insensitive search

#### `updateStudent` (Admin only)
- **Purpose**: Updates student information
- **Process**:
  1. Validates student ID
  2. Updates allowed fields
  3. Runs validation on updated data
  4. Returns updated student record

#### `deleteStudent` (Admin only)
- **Purpose**: Removes a student record
- **Process**:
  1. Finds student by ID
  2. Deletes student from database
  3. Returns deletion confirmation

## Middleware

### Token Verification (`verifyToken.js`)

#### `verifyToken`
- **Purpose**: Verifies JWT token for protected routes
- **Process**:
  1. Extracts token from cookies
  2. Verifies token using JWT secret
  3. Attaches user information to request object

## Models

### User Model (`user.model.js`)

- **Fields**:
  - `email`: String (required, unique)
  - `password`: String (required)
  - `name`: String (required)
  - `department`: String (required)
  - `lastLogin`: Date
  - `isVerified`: Boolean
  - `resetPasswordToken`: String
  - `resetPasswordExpiresAt`: Date
  - `verificationToken`: String
  - `verificationTokenExpiresAt`: Date

### Student Model (`student.model.js`)

- **Fields**:
  - `email`: String (required, unique, lowercase, validated)
  - `registerNumber`: String (required, unique, uppercase)
  - `name`: String (required, 2-100 characters)
  - `department`: String (required, enum: CSE, ECE, EEE, MECH, CIVIL, IT, AIDS)
  - `joiningYear`: Number (required, min: 2000, max: current year + 1)
  - `passOutYear`: Number (required, min: 2000)
  - `dateOfBirth`: Date (required)
  - `mobileNumber`: String (required, unique, 10-digit validation)
- **Validation**:
  - Email format validation
  - Pass out year must be after joining year
  - Mobile number must be 10 digits
  - Register number converted to uppercase
- **Indexes**:
  - Index on `department` for department-wise queries
  - Text index on `name` for search functionality
  - Unique indexes on `registerNumber`, `email`, `mobileNumber`

### GridFS Semester PDF Model (`gridFSSemesterPDF.model.js`)

- **Fields**:
  - `uploadName`: String (required, indexed)
  - `semester`: Number (required, 0-8)
  - `fileId`: ObjectId (required)
  - `filename`: String (required)
  - `uploadDate`: Date
  - `deleteAt`: Date (required)
- **Indexes**:
  - Compound index on `uploadName` and `semester` (unique)
  - Index on `deleteAt` for automatic expiration

## Services

### PDF.co Service (`pdfCoService.js`)

#### `uploadPdfToPdfCo`
- **Purpose**: Uploads a PDF to PDF.co service
- **Parameters**: `fileBuffer`, `fileName`
- **Returns**: Response with URL to uploaded file

#### `convertPdfToCsv`
- **Purpose**: Converts a PDF to CSV format using PDF.co
- **Parameters**: `pdfUrl`, `options`
- **Returns**: CSV content as string

#### `parseCsvToResultJson`
- **Purpose**: Parses CSV data into structured JSON
- **Parameters**: `csvData`
- **Returns**: Structured student results data

## Utilities

### Token Generation (`generateTokenAndSetCookie.js`)

#### `generateTokenAndSetCookie`
- **Purpose**: Generates JWT token and sets cookies
- **Parameters**: `userId`, `res`
- **Returns**: Generated token

### GridFS Configuration (`gridfsConfig.js`)

#### `initGridFS`
- **Purpose**: Initializes GridFS connection
- **Parameters**: `connection`
- **Returns**: GridFS objects

#### `getGridFSBucket`
- **Purpose**: Gets GridFS bucket
- **Returns**: GridFS bucket

#### `getFiles`, `getFileByFilename`, `getFileById`, `deleteFileById`, `deleteFilesByMetadata`
- **Purpose**: Various GridFS file operations

### PDF Cleanup (`cleanupExpiredPDFs.js`)

#### `cleanupExpiredPDFs`
- **Purpose**: Deletes expired PDFs from GridFS
- **Returns**: Deletion statistics

#### `scheduleCleanup`
- **Purpose**: Schedules periodic cleanup
- **Parameters**: `intervalMinutes`

## Enhanced Email Verification System

The application features a robust email verification system designed to handle expired codes gracefully and provide seamless user experience.

### Key Features

#### Automatic Code Regeneration
- **Expired Code Detection**: When a user submits an expired verification code, the system automatically detects it
- **Seamless Regeneration**: A new verification code is generated and sent immediately
- **User-Friendly Messaging**: Clear feedback is provided about the code expiry and new code delivery

#### Proactive Code Delivery
- **Auto-Resend on Page Load**: When users visit the verification page, a fresh code is automatically sent
- **Manual Resend Option**: Users can manually request new codes via a "Resend" button
- **Smart Email Management**: Codes are only sent to verified email addresses in the system

#### Enhanced User Experience
- **Loading States**: Visual feedback during code sending and verification processes
- **Toast Notifications**: Real-time success and error messages
- **Input Validation**: Proper form validation and error handling
- **Role-Based Redirection**: Automatic redirection to appropriate dashboards after verification

### Technical Implementation

#### Backend Features
- **Dual Token Validation**: Checks both valid and expired tokens
- **Automatic Email Dispatch**: Integrated email sending for new codes
- **10-Minute Expiry**: Short expiry window for security
- **Comprehensive Logging**: Detailed logging for debugging and monitoring

#### Frontend Features
- **Auto-Resend on Mount**: Fresh codes sent when component loads
- **Session Storage Integration**: Remembers user email across pages
- **Responsive UI**: Loading states and disabled buttons during operations
- **Error Recovery**: Graceful handling of network and validation errors

### Verification Flow

1. **User Registration**: Account created with email verification required
2. **Initial Code**: Verification code sent during signup
3. **Page Visit**: Fresh code automatically sent when user visits verification page
4. **Code Submission**: 
   - If valid: User verified and redirected to dashboard
   - If expired: New code generated and sent automatically
   - If invalid: Error message displayed
5. **Manual Resend**: Users can request new codes at any time
6. **Role-Based Redirect**: Verified users redirected to appropriate dashboard (admin/faculty)

### Error Handling

- **Network Failures**: Graceful degradation with retry options
- **Email Service Issues**: Logged errors with user-friendly messages
- **Database Timeouts**: Proper error messages and recovery suggestions
- **Invalid Tokens**: Clear distinction between expired and invalid codes

## Authentication Flow

1. User registers with email, password, name, and department
2. Verification email is sent with a token (10-minute expiry)
3. User visits verification page → Fresh code automatically sent
4. User verifies email with token (handles expired codes automatically)
5. User logs in with email and password
6. JWT token is generated and set as cookies
7. Protected routes verify token using middleware

## PDF Processing Flow

1. User uploads PDF
2. PDF is split into semester-wise sections
3. Each section is saved as a separate PDF in GridFS
4. Metadata is stored in MongoDB
5. PDFs are automatically deleted after a specified time

## PDF Analysis Flow

1. User requests analysis of a PDF
2. PDF is retrieved from GridFS
3. PDF is uploaded to PDF.co
4. PDF is converted to CSV using PDF.co
5. CSV is parsed into structured JSON
6. Analysis results are returned to the user