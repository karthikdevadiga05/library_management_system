# 📡 API DOCUMENTATION
## Library Management System - Complete API Reference

---

## 🔗 Base URL
```
http://localhost/library-management-system/backend/api
```

---

## 📋 Table of Contents

1. [Authentication APIs](#authentication-apis)
2. [Book Management APIs](#book-management-apis)
3. [Transaction APIs](#transaction-apis)
4. [Library APIs](#library-apis)
5. [Admin APIs](#admin-apis)
6. [Response Codes](#response-codes)
7. [Error Handling](#error-handling)

---

## 🔐 Authentication APIs

### 1. User Login

**Endpoint:** `/auth/login.php`

**Method:** `POST`

**Description:** Authenticate user and retrieve user details

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "password"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "user_id": 3,
    "username": "john_doe",
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543211",
    "city": "Mumbai",
    "latitude": 19.1136,
    "longitude": 72.8697,
    "user_type": "user",
    "status": "active",
    "library_id": null,
    "library_name": null
  }
}
```

**Error Response (401):**
```json
{
  "message": "Invalid credentials"
}
```

---

### 2. User Registration

**Endpoint:** `/auth/register.php`

**Method:** `POST`

**Description:** Register new user or library

**Request Body (User):**
```json
{
  "username": "new_user",
  "password": "password123",
  "full_name": "New User",
  "email": "newuser@example.com",
  "phone": "1234567890",
  "address": "123 Main St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "latitude": "19.0760",
  "longitude": "72.8777",
  "user_type": "user"
}
```

**Request Body (Library):**
```json
{
  "username": "new_library",
  "password": "password123",
  "full_name": "New Library",
  "email": "library@example.com",
  "phone": "1234567890",
  "address": "456 Library St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "latitude": "19.0760",
  "longitude": "72.8777",
  "user_type": "library",
  "library_name": "New Central Library",
  "registration_number": "LIB-2024-001",
  "established_year": "2024",
  "description": "A modern library",
  "opening_hours": "9AM-6PM"
}
```

**Success Response (201):**
```json
{
  "message": "Registration successful",
  "user_id": 15
}
```

**Error Response (400):**
```json
{
  "message": "Username or email already exists"
}
```

---

### 3. Logout

**Endpoint:** `/auth/logout.php`

**Method:** `GET` or `POST`

**Description:** Clear user session

**Success Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

## 📚 Book Management APIs

### 1. Search Books

**Endpoint:** `/books/search_books.php`

**Method:** `GET`

**Description:** Search books across all libraries with location-based sorting

**Query Parameters:**
- `q` (required): Search query (title, author, or category)
- `lat` (optional): User latitude for distance calculation
- `lon` (optional): User longitude for distance calculation

**Example:**
```
GET /books/search_books.php?q=Harry%20Potter&lat=19.0760&lon=72.8777
```

**Success Response (200):**
```json
[
  {
    "book_id": 1,
    "library_id": 1,
    "isbn": "978-0439708180",
    "title": "Harry Potter and the Sorcerer's Stone",
    "author": "J.K. Rowling",
    "publisher": "Scholastic",
    "publication_year": 1998,
    "category": "Fiction",
    "language": "English",
    "description": "The first book in the Harry Potter series",
    "price": 19.99,
    "total_copies": 5,
    "available_copies": 3,
    "status": "active",
    "library_name": "Central Library",
    "city": "Mumbai",
    "latitude": 19.0760,
    "longitude": 72.8777,
    "distance": 0.52
  }
]
```

**Error Response (400):**
```json
{
  "message": "Search query required"
}
```

---

### 2. Get Books by Library

**Endpoint:** `/books/get_books.php`

**Method:** `GET`

**Description:** Get all books from a specific library

**Query Parameters:**
- `library_id` (required): Library ID

**Example:**
```
GET /books/get_books.php?library_id=1
```

**Success Response (200):**
```json
[
  {
    "book_id": 1,
    "library_id": 1,
    "isbn": "978-0439708180",
    "title": "Harry Potter",
    "author": "J.K. Rowling",
    "publisher": "Scholastic",
    "publication_year": 1998,
    "category": "Fiction",
    "language": "English",
    "price": 19.99,
    "total_copies": 5,
    "available_copies": 3,
    "status": "active",
    "created_at": "2024-11-29 10:30:00"
  }
]
```

---

### 3. Add Book

**Endpoint:** `/books/add_book.php`

**Method:** `POST`

**Description:** Add a new book to library inventory (Library only)

**Request Body:**
```json
{
  "library_id": 1,
  "isbn": "978-0439708180",
  "title": "Harry Potter and the Sorcerer's Stone",
  "author": "J.K. Rowling",
  "publisher": "Scholastic",
  "publication_year": 1998,
  "category": "Fiction",
  "language": "English",
  "price": 19.99,
  "total_copies": 5,
  "description": "First book in the series"
}
```

**Success Response (201):**
```json
{
  "message": "Book added successfully",
  "book_id": 25
}
```

**Error Response (400):**
```json
{
  "message": "Incomplete data"
}
```

---

### 4. Update Book

**Endpoint:** `/books/update_book.php`

**Method:** `POST`

**Description:** Update book details (Library only)

**Request Body:**
```json
{
  "book_id": 1,
  "title": "Updated Title",
  "author": "Updated Author",
  "isbn": "978-0439708180",
  "publisher": "Scholastic",
  "publication_year": 1998,
  "category": "Fiction",
  "language": "English",
  "price": 24.99,
  "total_copies": 7,
  "description": "Updated description",
  "status": "active"
}
```

**Success Response (200):**
```json
{
  "message": "Book updated successfully"
}
```

---

## 💳 Transaction APIs

### 1. Borrow Book

**Endpoint:** `/transactions/borrow_book.php`

**Method:** `POST`

**Description:** Borrow a book from library

**Request Body:**
```json
{
  "user_id": 3,
  "library_id": 1,
  "book_id": 1
}
```

**Success Response (201):**
```json
{
  "message": "Book borrowed successfully. Visit library within 24 hours",
  "transaction_id": 15,
  "due_date": "2024-12-13 14:30:00"
}
```

**Error Response (400):**
```json
{
  "message": "Book not available"
}
```

---

### 2. Purchase Request

**Endpoint:** `/transactions/purchase_request.php`

**Method:** `POST`

**Description:** Request to purchase a book

**Request Body:**
```json
{
  "user_id": 3,
  "library_id": 1,
  "book_id": 1,
  "price": 19.99
}
```

**Success Response (201):**
```json
{
  "message": "Purchase request sent",
  "transaction_id": 16
}
```

---

### 3. Approve Purchase

**Endpoint:** `/transactions/approve_purchase.php`

**Method:** `POST`

**Description:** Approve a purchase request (Library only)

**Request Body:**
```json
{
  "transaction_id": 16
}
```

**Success Response (200):**
```json
{
  "message": "Purchase approved"
}
```

---

### 4. Confirm Visit

**Endpoint:** `/transactions/confirm_visit.php`

**Method:** `POST`

**Description:** Confirm user visit and activate borrowed book (Library only)

**Request Body:**
```json
{
  "transaction_id": 15
}
```

**Success Response (200):**
```json
{
  "message": "Visit confirmed, book issued"
}
```

---

### 5. Return Book

**Endpoint:** `/transactions/return_book.php`

**Method:** `POST`

**Description:** Process book return (Library only)

**Request Body:**
```json
{
  "transaction_id": 15
}
```

**Success Response (200):**
```json
{
  "message": "Book returned successfully",
  "fine_amount": 5.00
}
```

---

### 6. Pay Fine

**Endpoint:** `/transactions/pay_fine.php`

**Method:** `POST`

**Description:** Process fine payment (Library only)

**Request Body:**
```json
{
  "transaction_id": 15,
  "amount_paid": 5.00
}
```

**Success Response (200):**
```json
{
  "message": "Fine paid successfully"
}
```

---

### 7. Get Transactions

**Endpoint:** `/transactions/get_transactions.php`

**Method:** `GET`

**Description:** Get transaction history

**Query Parameters:**
- `user_id` (optional): Filter by user
- `library_id` (optional): Filter by library

**Example:**
```
GET /transactions/get_transactions.php?user_id=3
```

**Success Response (200):**
```json
[
  {
    "transaction_id": 15,
    "user_id": 3,
    "library_id": 1,
    "book_id": 1,
    "transaction_type": "borrow",
    "status": "active",
    "borrow_date": "2024-11-29 14:30:00",
    "due_date": "2024-12-13 14:30:00",
    "return_date": null,
    "visit_confirmed": true,
    "price": null,
    "fine_amount": 0.00,
    "payment_status": "pending",
    "book_title": "Harry Potter",
    "author": "J.K. Rowling",
    "book_price": 19.99,
    "user_name": "John Doe",
    "user_email": "john@example.com",
    "user_phone": "9876543211",
    "library_name": "Central Library",
    "calculated_fine": 0.00,
    "created_at": "2024-11-29 14:30:00"
  }
]
```

---

### 8. Check Expired Transactions

**Endpoint:** `/transactions/check_expired.php`

**Method:** `GET`

**Description:** Auto-expire pending transactions after 24 hours

**Success Response (200):**
```json
{
  "message": "Checked expired transactions",
  "expired_count": 2
}
```

---

## 🏛️ Library APIs

### 1. Get Nearby Libraries

**Endpoint:** `/libraries/get_nearby.php`

**Method:** `GET`

**Description:** Get all libraries sorted by distance from user

**Query Parameters:**
- `lat` (optional): User latitude
- `lon` (optional): User longitude

**Example:**
```
GET /libraries/get_nearby.php?lat=19.0760&lon=72.8777
```

**Success Response (200):**
```json
[
  {
    "library_id": 1,
    "user_id": 2,
    "library_name": "Central Public Library",
    "registration_number": "LIB-2024-001",
    "established_year": 2020,
    "description": "Modern library with vast collection",
    "opening_hours": "Mon-Sat: 9AM-8PM",
    "total_books": 150,
    "city": "Mumbai",
    "address": "MG Road",
    "latitude": 19.0760,
    "longitude": 72.8777,
    "phone": "9876543210",
    "email": "central@library.com",
    "distance": 0.52
  }
]
```

---

### 2. Get Library Statistics

**Endpoint:** `/libraries/get_library_stats.php`

**Method:** `GET`

**Description:** Get statistics for a specific library

**Query Parameters:**
- `library_id` (required): Library ID

**Example:**
```
GET /libraries/get_library_stats.php?library_id=1
```

**Success Response (200):**
```json
{
  "total_books": 150,
  "available_books": 120,
  "active_loans": 25,
  "pending_requests": 5,
  "total_revenue": 2500.50,
  "overdue_books": 3
}
```

---

## 👨‍💼 Admin APIs

### 1. Get All Users

**Endpoint:** `/admin/get_users.php`

**Method:** `GET`

**Description:** Get all registered users (Admin only)

**Success Response (200):**
```json
[
  {
    "user_id": 3,
    "username": "john_doe",
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543211",
    "city": "Mumbai",
    "user_type": "user",
    "status": "active",
    "created_at": "2024-11-01 10:00:00"
  }
]
```

---

### 2. Get All Libraries

**Endpoint:** `/admin/get_libraries.php`

**Method:** `GET`

**Description:** Get all registered libraries (Admin only)

**Success Response (200):**
```json
[
  {
    "library_id": 1,
    "user_id": 2,
    "library_name": "Central Library",
    "registration_number": "LIB-2024-001",
    "established_year": 2020,
    "total_books": 150,
    "email": "central@library.com",
    "phone": "9876543210",
    "address": "MG Road",
    "city": "Mumbai",
    "status": "active"
  }
]
```

---

### 3. Update User Status

**Endpoint:** `/admin/update_user_status.php`

**Method:** `POST`

**Description:** Activate or suspend user account (Admin only)

**Request Body:**
```json
{
  "user_id": 3,
  "status": "suspended"
}
```

**Allowed Status Values:**
- `active`
- `inactive`
- `suspended`

**Success Response (200):**
```json
{
  "message": "User status updated successfully"
}
```

---

### 4. System Statistics

**Endpoint:** `/admin/system_stats.php`

**Method:** `GET`

**Description:** Get system-wide statistics (Admin only)

**Success Response (200):**
```json
{
  "stats": {
    "totalUsers": 250,
    "totalLibraries": 15,
    "totalBooks": 5000,
    "activeLoans": 150,
    "pendingTransactions": 25,
    "totalRevenue": 12500.75,
    "totalFines": 350.00,
    "completedTransactions": 500
  }
}
```

---

## 📊 Response Codes

### Success Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |

### Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Invalid credentials |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error - Server error |
| 503 | Service Unavailable - Database error |

---

## ⚠️ Error Handling

### Standard Error Response Format
```json
{
  "message": "Error description here"
}
```

### Common Error Messages

**Authentication Errors:**
```json
{
  "message": "Invalid credentials"
}
```

**Validation Errors:**
```json
{
  "message": "Incomplete data"
}
```

**Database Errors:**
```json
{
  "message": "Database error: Connection failed"
}
```

**Authorization Errors:**
```json
{
  "message": "Access denied"
}
```

---

## 🔧 Request Headers

### Required Headers
```
Content-Type: application/json
Accept: application/json
```

### Optional Headers
```
Authorization: Bearer {token}  // For future JWT implementation
```

---

## 📝 Data Validation Rules

### User Registration
- Username: 3-50 characters, alphanumeric
- Password: Minimum 6 characters
- Email: Valid email format
- Phone: 10-15 digits
- Latitude/Longitude: Valid decimal coordinates

### Book Addition
- Title: Required, max 200 characters
- Author: Required, max 100 characters
- Price: Positive decimal, max 2 decimal places
- Total Copies: Positive integer

### Transaction Creation
- User must be active
- Book must be available
- Library must be active

---

## 🚀 Rate Limiting

Currently, no rate limiting is implemented. For production:

**Recommended Limits:**
- Authentication: 5 requests/minute
- Search: 30 requests/minute
- Transactions: 10 requests/minute
- Admin: 50 requests/minute

---

## 🔐 Security Considerations

1. **Password Storage:** Bcrypt hashing (cost factor 10)
2. **SQL Injection:** Prepared statements (PDO)
3. **XSS Protection:** Input sanitization
4. **CORS:** Configured for localhost development
5. **Input Validation:** Both frontend and backend

---

## 📖 Usage Examples

### JavaScript (Axios)
```javascript
// Login
const login = async (username, password) => {
  try {
    const response = await axios.post(
      'http://localhost/library-management-system/backend/api/auth/login.php',
      { username, password }
    );
    return response.data;
  } catch (error) {
    console.error('Login failed:', error.response.data);
  }
};

// Search Books
const searchBooks = async (query, lat, lon) => {
  try {
    const response = await axios.get(
      `http://localhost/library-management-system/backend/api/books/search_books.php`,
      { params: { q: query, lat, lon } }
    );
    return response.data;
  } catch (error) {
    console.error('Search failed:', error);
  }
};

// Borrow Book
const borrowBook = async (userId, libraryId, bookId) => {
  try {
    const response = await axios.post(
      'http://localhost/library-management-system/backend/api/transactions/borrow_book.php',
      { user_id: userId, library_id: libraryId, book_id: bookId }
    );
    return response.data;
  } catch (error) {
    console.error('Borrow failed:', error.response.data);
  }
};
```

### PHP (cURL)
```php
// Login Example
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://localhost/library-management-system/backend/api/auth/login.php");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'username' => 'john_doe',
    'password' => 'password'
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
print_r($data);
```

---

## 🧪 Testing Endpoints

### Using Postman

1. **Import Collection:**
   - Base URL: `http://localhost/library-management-system/backend/api`
   - Set headers: `Content-Type: application/json`

2. **Test Authentication:**
   - POST `/auth/login.php`
   - Body: `{"username": "john_doe", "password": "password"}`

3. **Test Book Search:**
   - GET `/books/search_books.php?q=Harry&lat=19.0760&lon=72.8777`

### Using Browser Console
```javascript
// Test in browser console (F12)
fetch('http://localhost/library-management-system/backend/api/auth/login.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'john_doe',
    password: 'password'
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));
```

---


## 📅 Version History

**v1.0.0** - Initial Release (November 2024)
- Authentication APIs
- Book Management APIs
- Transaction APIs
- Library APIs
- Admin APIs

---

**Last Updated:** December 10, 2025

**Maintained By:** Karthik R Sherigara - MCA 1st year Year Project

---

*© 2025 Library Management System. All rights reserved.*
```
