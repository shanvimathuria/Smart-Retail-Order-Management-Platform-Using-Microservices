# Authentication Setup Guide

## Overview
Your React frontend is now fully integrated with your backend user service with JWT authentication.

## Features Implemented

### ✅ User Authentication
- **Login**: Users can log in with email and password
- **Signup**: New users can register with name, email, phone, and password
- **JWT Token Management**: Automatic token handling and storage
- **Protected Routes**: Some routes require authentication
- **User Session Persistence**: Login state persists across browser sessions

### ✅ User Interface
- **Navigation Bar**: Shows user icon and name when logged in
- **User Dropdown**: Profile options and logout functionality
- **Loading States**: Shows loading during authentication checks
- **Toast Notifications**: Success/error feedback for auth actions

### ✅ User-Specific Features
- **User-Specific Cart**: Cart data is stored per user
- **Guest vs Authenticated**: Different cart storage for guests vs users
- **Seamless Flow**: Automatic login after registration

## How It Works

### Backend Integration
- **API Base URL**: Configurable via `.env.local` file
- **Endpoints Used**:
  - `POST /users/register` - Create new user account
  - `POST /users/login` - Authenticate and get JWT token
  - `GET /users/` - Fetch user list (for user lookup)

### Authentication Flow
1. User enters credentials on login form
2. Frontend sends request to backend `/users/login`
3. Backend validates and returns JWT token
4. Frontend stores token in localStorage
5. Token is included in subsequent API requests
6. User stays logged in until logout or token expires

### Data Storage
- **User Data**: Stored in localStorage as `auth_user`
- **JWT Token**: Stored in localStorage as `auth_token`
- **Cart Data**: Stored per user as `cart_${userId}` or `cart_guest`

## Configuration

### Environment Variables (`.env.local`)
```env
VITE_USER_API_URL=http://127.0.0.1:8002
VITE_INVENTORY_API_URL=http://127.0.0.1:8003
```

### Backend Requirements
Your backend should return login response in this format:
```json
{
  "access_token": "jwt_token_here",
  "token_type": "Bearer",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

## Usage

### For Users
1. **Registration**: Click "Sign Up" → Fill form → Automatic login
2. **Login**: Click "Login" → Enter credentials → Redirected to dashboard
3. **Shopping**: Add items to cart (saved per user)
4. **Logout**: Click user menu → Logout

### For Developers
1. **Check Auth State**: Use `useAuth()` hook
2. **Protect Routes**: Wrap with `<ProtectedRoute>`
3. **User Data**: Access via `user` from `useAuth()`
4. **API Requests**: Use `getStoredAuthHeader()` for authenticated requests

## Testing the System

1. **Start your backend services** (user service on port 8002)
2. **Start the frontend**: `npm run dev`
3. **Test Registration**:
   - Go to `/signup`
   - Fill in all required fields
   - Submit and verify auto-login
4. **Test Login**:
   - Go to `/login`
   - Enter registered credentials
   - Verify user icon appears in navigation
5. **Test Cart Persistence**:
   - Add items to cart while logged in
   - Logout and login again
   - Verify cart items are restored

## API Integration Notes

- **Proxy Configuration**: Already set up in `vite.config.ts`
- **CORS**: Handled by proxy in development
- **Error Handling**: User-friendly error messages
- **Token Refresh**: Currently uses simple token storage (can be enhanced for refresh tokens)

Your authentication system is now ready to use with your backend API!