
# CF Tracker API Documentation

## Base URL
```
https://cf-tracker-server.onrender.com/
```

## Authentication
The API uses JSON Web Tokens (JWT) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Endpoints

### Problems

#### Get All Problems
Retrieves a list of all problems, with optional tag filtering.

- **URL**: `/problems`
- **Method**: `GET`
- **Authentication**: Not required
- **URL Parameters**:
  - `tag` (optional): Filter problems by tag

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
[
  {
    "_id": "problem_id",
    "name": "Problem Name",
    "rating": 1500,
    "link": "https://example.com/problem",
    "submissionLink": "https://example.com/submission",
    "tags": ["dp", "greedy"]
  }
]
```

**Error Response**:
- **Code**: 500 Internal Server Error
- **Content**:
```json
{
  "message": "Error fetching problems"
}
```

---

#### Create Problem
Adds a new competitive programming problem to the database.

- **URL**: `/problems`
- **Method**: `POST`
- **Authentication**: Required
- **Body**:
```json
{
  "name": "Problem Name",
  "rating": 1500,
  "link": "https://example.com/problem",
  "submissionLink": "https://example.com/submission",
  "tags": ["dp", "greedy"]
}
```

**Success Response**:
- **Code**: 201 Created
- **Content**:
```json
{
  "message": "Problem created successfully"
}
```

**Error Response**:
- **Code**: 400 Bad Request
- **Content**:
```json
{
  "errors": [
    {
      "param": "name",
      "msg": "Invalid value"
    }
  ]
}
```

OR

- **Code**: 500 Internal Server Error
- **Content**:
```json
{
  "message": "Error creating problem"
}
```

---

#### Mark Problem as Solved
Updates a problem to mark it as solved.

- **URL**: `/problems/:id/solve`
- **Method**: `PATCH`
- **Authentication**: Required
- **URL Parameters**:
  - `id`: Problem ID

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "message": "Problem marked as solved"
}
```

**Error Response**:
- **Code**: 404 Not Found
- **Content**:
```json
{
  "message": "Problem not found"
}
```

OR

- **Code**: 500 Internal Server Error
- **Content**:
```json
{
  "message": "Error marking problem as solved"
}
```

---

#### Delete Problem
Removes a problem from the database.

- **URL**: `/problems/:id`
- **Method**: `DELETE`
- **Authentication**: Required
- **URL Parameters**:
  - `id`: Problem ID

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "message": "Problem deleted successfully"
}
```

**Error Response**:
- **Code**: 404 Not Found
- **Content**:
```json
{
  "message": "Problem not found"
}
```

OR

- **Code**: 500 Internal Server Error
- **Content**:
```json
{
  "message": "Error deleting problem"
}
```

---

### Users

#### Register User
Creates a new user account.

- **URL**: `/register`
- **Method**: `POST`
- **Authentication**: Not required
- **Body**:
```json
{
  "username": "username",
  "password": "password"
}
```

**Success Response**:
- **Code**: 201 Created
- **Content**:
```json
{
  "message": "User created successfully"
}
```

**Error Response**:
- **Code**: 400 Bad Request
- **Content**:
```json
{
  "message": "Username already exists"
}
```

OR

- **Code**: 500 Internal Server Error
- **Content**:
```json
{
  "message": "Error creating user"
}
```

---

#### Login
Authenticates a user and returns a JWT token.

- **URL**: `/login`
- **Method**: `POST`
- **Authentication**: Not required
- **Body**:
```json
{
  "username": "username",
  "password": "password"
}
```

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "token": "your_jwt_token"
}
```

**Error Response**:
- **Code**: 401 Unauthorized
- **Content**:
```json
{
  "message": "Invalid credentials"
}
```

OR

- **Code**: 500 Internal Server Error
- **Content**:
```json
{
  "message": "Error logging in"
}
```

---

#### Update User Profile
Updates a user's profile information.

- **URL**: `/users/:id`
- **Method**: `PATCH`
- **Authentication**: Required
- **URL Parameters**:
  - `id`: User ID
- **Body**:
```json
{
  "username": "new_username",
  "password": "new_password"
}
```

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "message": "User profile updated"
}
```

**Error Response**:
- **Code**: 404 Not Found
- **Content**:
```json
{
  "message": "User not found"
}
```

OR

- **Code**: 500 Internal Server Error
- **Content**:
```json
{
  "message": "Error updating user profile"
}
```

---

#### Delete User
Removes a user account from the database.

- **URL**: `/users/:id`
- **Method**: `DELETE`
- **Authentication**: Required
- **URL Parameters**:
  - `id`: User ID

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "message": "User deleted successfully"
}
```

**Error Response**:
- **Code**: 404 Not Found
- **Content**:
```json
{
  "message": "User not found"
}
```

OR

- **Code**: 500 Internal Server Error
- **Content**:
```json
{
  "message": "Error deleting user"
}
```

---

### Statistics

#### Get Site Statistics
Retrieves overall statistics for the site.

- **URL**: `/stats`
- **Method**: `GET`
- **Authentication**: Not required

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "totalUsers": 10,
  "totalProblems": 100,
  "solvedProblemsCount": 50,
  "unsolvedProblemsCount": 50
}
```

**Error Response**:
- **Code**: 500 Internal Server Error
- **Content**:
```json
{
  "message": "Error fetching site statistics"
}
```

## Data Models

### Problem
```
{
  name: String (required),
  rating: Number (required),
  link: String (required),
  submissionLink: String (required),
  tags: [String] (required),
  solved: Boolean
}
```

### User
```
{
  username: String (required, unique),
  password: String (required),
  isAdmin: Boolean (default: false),
  solvedProblems: [Problem IDs]
}
```

## Notes
- All timestamps are returned in ISO 8601 format: `YYYY-MM-DDTHH:MM:SSZ`
- All authentication errors will return 401 Unauthorized or 403 Forbidden
- Production deployments should implement proper password hashing and HTTPS
