# Backend Connection Troubleshooting Guide

## The Issue
Frontend shows "Failed to fetch" when clicking the "Extract Details" button.

## Diagnosis Steps

### Step 1: Start the Test Backend Server
1. Double-click `start-test-backend.bat` in the root directory
2. This will start a simplified backend server on port 8080
3. Look for the message: "🚀 Test Backend Server is running!"

### Step 2: Test Backend Connection
Open your browser and visit:
- http://localhost:8080 (should show "Backend server is running!")
- http://localhost:8080/api/processed-results/test (should show test API message)

### Step 3: Check Frontend Console
1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Try uploading a PDF
4. Look for detailed error messages starting with 🚀, 📄, 🔗, etc.

### Step 4: Common Issues and Solutions

#### Issue: "Cannot connect to backend server"
**Solution:** Start the backend server:
1. Open Command Prompt or PowerShell
2. Navigate to the backend directory:
   ```
   cd "d:\Automated - College Result Portal\Copy -- website (2) -- presently working\Automated-Result-Portel\backend"
   ```
3. Run: `node server.js` or `node test-server.js`

#### Issue: "Port 8080 is already in use"
**Solution:** 
1. Kill any existing processes on port 8080
2. Or change the port in both:
   - `backend/server.js` (change PORT variable)
   - `frontend/src/api/processedResult.js` (change API_URL)

#### Issue: "CORS error"
**Solution:** The CORS is already configured for localhost:5173. Make sure frontend is running on this port.

#### Issue: "Database connection error"
**Solution:** The test server doesn't need database. If using full server, check .env file exists with correct MONGO_URI.

### Step 5: If Test Server Works
If the test server works but the main server doesn't:
1. Use `start-backend.bat` to start the full server
2. Check for database connection errors
3. Ensure all dependencies are installed: `npm install`

### Step 6: Manual Backend Start
If batch files don't work:
1. Open Command Prompt as Administrator
2. Navigate to backend directory
3. Run: `npm install` (if first time)
4. Run: `node server.js`

## Enhanced Error Logging
The frontend now includes detailed console logging. Check browser console for:
- 🚀 Request initiation
- 📄 File details
- 🔗 API URL being called
- 📡 Request sending
- 📨 Response details
- ✅ Success messages
- ❌ Error details

## Quick Test Commands
```bash
# Test if backend port is open
netstat -an | findstr :8080

# Kill process on port 8080 (if needed)
netsh interface ipv4 show excludedportrange protocol=tcp
```

## Files Created for Troubleshooting
- `start-test-backend.bat` - Simplified server for testing
- `start-backend.bat` - Full server startup
- `backend/test-server.js` - Minimal server for diagnosis
- Enhanced error logging in `frontend/src/api/processedResult.js`
