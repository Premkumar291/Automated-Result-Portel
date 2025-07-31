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
- **Purpose**: Verifies a user's email address
- **Process**:
  1. Validates verification code
  2. Finds user with matching code that hasn't expired
  3. Marks user as verified
  4. Sends confirmation email

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

## Authentication Flow

1. User registers with email, password, name, and department
2. Verification email is sent with a token
3. User verifies email with token
4. User logs in with email and password
5. JWT token is generated and set as cookies
6. Protected routes verify token using middleware

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