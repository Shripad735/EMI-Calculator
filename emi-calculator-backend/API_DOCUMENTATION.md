# EMI Calculator API Documentation

## Base URL

**Development:** `http://localhost:5000`  
**Production:** `https://your-backend-domain.com`

## Authentication

The API uses JWT (JSON Web Token) for authentication. After successful signup or login, you'll receive a token that must be included in subsequent requests.

### Including the Token

For protected endpoints, include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Token Expiration

Tokens expire after 7 days by default (configurable via `JWT_EXPIRES_IN` environment variable).

---

## Endpoints

### Authentication Endpoints

#### 1. Signup

Create a new user account.

**Endpoint:** `POST /auth/signup`  
**Authentication:** Not required

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Request Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | User's full name (min 1 character) |
| email | string | Yes | Valid email address |
| password | string | Yes | Password (min 6 characters) |

**Success Response (201 Created):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request** - Validation failed:
```json
{
  "message": "Validation failed",
  "errors": {
    "email": "Email already exists"
  }
}
```

**400 Bad Request** - Missing fields:
```json
{
  "message": "Validation failed",
  "errors": {
    "name": "Name is required",
    "email": "Email is required",
    "password": "Password is required"
  }
}
```

**Example cURL:**

```bash
curl -X POST http://localhost:5000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

---

#### 2. Login

Authenticate an existing user.

**Endpoint:** `POST /auth/login`  
**Authentication:** Not required

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Request Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User's email address |
| password | string | Yes | User's password |

**Success Response (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**

**401 Unauthorized** - Invalid credentials:
```json
{
  "message": "Invalid credentials"
}
```

**400 Bad Request** - Missing fields:
```json
{
  "message": "Validation failed",
  "errors": {
    "email": "Email is required",
    "password": "Password is required"
  }
}
```

**Example cURL:**

```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

---

### Plans Endpoints

All plans endpoints require authentication. Include the JWT token in the Authorization header.

#### 3. Get All Plans

Retrieve all saved EMI calculation plans for the authenticated user.

**Endpoint:** `GET /plans`  
**Authentication:** Required

**Request Headers:**

```
Authorization: Bearer <your-jwt-token>
```

**Success Response (200 OK):**

```json
{
  "plans": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439011",
      "loanAmount": 1000000,
      "interestRate": 8.5,
      "tenure": 240,
      "loanType": "Home",
      "emi": 7675.50,
      "totalInterest": 842120.00,
      "totalAmountPayable": 1842120.00,
      "createdAt": "2024-01-15T11:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "userId": "507f1f77bcf86cd799439011",
      "loanAmount": 500000,
      "interestRate": 10.5,
      "tenure": 60,
      "loanType": "Personal",
      "emi": 10624.00,
      "totalInterest": 137440.00,
      "totalAmountPayable": 637440.00,
      "createdAt": "2024-01-15T12:00:00.000Z"
    }
  ]
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| plans | array | Array of plan objects |
| plans[]._id | string | Unique plan identifier |
| plans[].userId | string | ID of the user who owns the plan |
| plans[].loanAmount | number | Principal loan amount in rupees |
| plans[].interestRate | number | Annual interest rate as percentage |
| plans[].tenure | number | Loan tenure in months |
| plans[].loanType | string | Type of loan (Home, Personal, Vehicle) |
| plans[].emi | number | Monthly EMI amount |
| plans[].totalInterest | number | Total interest payable |
| plans[].totalAmountPayable | number | Total amount payable (principal + interest) |
| plans[].createdAt | string | ISO 8601 timestamp of plan creation |

**Error Responses:**

**401 Unauthorized** - Missing or invalid token:
```json
{
  "message": "Authentication required"
}
```

**Example cURL:**

```bash
curl -X GET http://localhost:5000/plans \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

#### 4. Create Plan

Save a new EMI calculation plan.

**Endpoint:** `POST /plans`  
**Authentication:** Required

**Request Headers:**

```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "loanAmount": 500000,
  "interestRate": 10.5,
  "tenure": 60,
  "loanType": "Personal",
  "emi": 10624.00,
  "totalInterest": 137440.00,
  "totalAmountPayable": 637440.00
}
```

**Request Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| loanAmount | number | Yes | Principal loan amount (must be > 0) |
| interestRate | number | Yes | Annual interest rate (0-100) |
| tenure | number | Yes | Loan tenure in months (must be > 0) |
| loanType | string | No | Type of loan (Home, Personal, Vehicle) |
| emi | number | Yes | Calculated monthly EMI amount |
| totalInterest | number | Yes | Total interest payable |
| totalAmountPayable | number | Yes | Total amount payable |

**Success Response (201 Created):**

```json
{
  "plan": {
    "_id": "507f1f77bcf86cd799439013",
    "userId": "507f1f77bcf86cd799439011",
    "loanAmount": 500000,
    "interestRate": 10.5,
    "tenure": 60,
    "loanType": "Personal",
    "emi": 10624.00,
    "totalInterest": 137440.00,
    "totalAmountPayable": 637440.00,
    "createdAt": "2024-01-15T12:00:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request** - Validation failed:
```json
{
  "message": "Validation failed",
  "errors": {
    "loanAmount": "Loan amount is required",
    "interestRate": "Interest rate is required"
  }
}
```

**401 Unauthorized** - Missing or invalid token:
```json
{
  "message": "Authentication required"
}
```

**Example cURL:**

```bash
curl -X POST http://localhost:5000/plans \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "loanAmount": 500000,
    "interestRate": 10.5,
    "tenure": 60,
    "loanType": "Personal",
    "emi": 10624.00,
    "totalInterest": 137440.00,
    "totalAmountPayable": 637440.00
  }'
```

---

#### 5. Delete Plan

Delete a saved plan by ID.

**Endpoint:** `DELETE /plans/:id`  
**Authentication:** Required

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The unique identifier of the plan to delete |

**Request Headers:**

```
Authorization: Bearer <your-jwt-token>
```

**Success Response (200 OK):**

```json
{
  "message": "Plan deleted successfully"
}
```

**Error Responses:**

**404 Not Found** - Plan doesn't exist:
```json
{
  "message": "Plan not found"
}
```

**403 Forbidden** - User doesn't own the plan:
```json
{
  "message": "Unauthorized to delete this plan"
}
```

**401 Unauthorized** - Missing or invalid token:
```json
{
  "message": "Authentication required"
}
```

**400 Bad Request** - Invalid plan ID format:
```json
{
  "message": "Invalid plan ID"
}
```

**Example cURL:**

```bash
curl -X DELETE http://localhost:5000/plans/507f1f77bcf86cd799439013 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Error Handling

### Error Response Format

All error responses follow this consistent format:

```json
{
  "message": "Human-readable error message",
  "errors": {
    "fieldName": "Field-specific error message"
  }
}
```

The `errors` object is optional and only included for validation errors.

### HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input or validation error |
| 401 | Unauthorized - Missing or invalid authentication token |
| 403 | Forbidden - User doesn't have permission for this resource |
| 404 | Not Found - Requested resource doesn't exist |
| 500 | Internal Server Error - Server-side error occurred |
| 503 | Service Unavailable - Server temporarily unavailable |

### Common Error Scenarios

#### Authentication Errors

**Missing Token:**
```json
{
  "message": "Authentication required"
}
```

**Invalid Token:**
```json
{
  "message": "Invalid token"
}
```

**Expired Token:**
```json
{
  "message": "Token expired"
}
```

#### Validation Errors

**Multiple Field Errors:**
```json
{
  "message": "Validation failed",
  "errors": {
    "loanAmount": "Loan amount must be greater than zero",
    "interestRate": "Interest rate is required",
    "tenure": "Tenure must be a whole number"
  }
}
```

#### Database Errors

**Connection Error:**
```json
{
  "message": "Database error. Please try again later."
}
```

---

## Rate Limiting

Currently, there are no rate limits implemented. However, it's recommended to implement rate limiting in production to prevent abuse.

**Recommended Limits:**
- Authentication endpoints: 5 requests per minute per IP
- Plans endpoints: 30 requests per minute per user

---

## CORS Configuration

The API is configured to accept requests from specific origins defined in the `ALLOWED_ORIGINS` environment variable.

**Development:** `http://localhost:19000,http://localhost:19006`  
**Production:** Configure with your actual frontend domain

---

## Testing the API

### Using cURL

All examples in this documentation use cURL. Make sure to:
1. Replace `http://localhost:5000` with your actual API URL
2. Replace token values with actual tokens from signup/login responses
3. Replace IDs with actual resource IDs

### Using Postman

1. Import the API endpoints into Postman
2. Set up an environment variable for `baseUrl` and `token`
3. Use `{{baseUrl}}` and `{{token}}` in your requests
4. After login/signup, save the token to your environment

### Example Workflow

1. **Signup:**
```bash
curl -X POST http://localhost:5000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

2. **Save the token from response**

3. **Create a plan:**
```bash
curl -X POST http://localhost:5000/plans \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "loanAmount": 1000000,
    "interestRate": 8.5,
    "tenure": 240,
    "loanType": "Home",
    "emi": 7675.50,
    "totalInterest": 842120.00,
    "totalAmountPayable": 1842120.00
  }'
```

4. **Get all plans:**
```bash
curl -X GET http://localhost:5000/plans \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

5. **Delete a plan:**
```bash
curl -X DELETE http://localhost:5000/plans/PLAN_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Data Models

### User Model

```javascript
{
  _id: ObjectId,           // Unique identifier
  name: String,            // User's full name
  email: String,           // Unique email address (lowercase)
  passwordHash: String,    // Bcrypt hashed password
  createdAt: Date          // Account creation timestamp
}
```

### Plan Model

```javascript
{
  _id: ObjectId,              // Unique identifier
  userId: ObjectId,           // Reference to User
  loanAmount: Number,         // Principal amount (min: 0)
  interestRate: Number,       // Annual rate (0-100)
  tenure: Number,             // Months (min: 1)
  loanType: String,           // 'Home', 'Personal', or 'Vehicle'
  emi: Number,                // Monthly EMI amount
  totalInterest: Number,      // Total interest payable
  totalAmountPayable: Number, // Total amount (principal + interest)
  createdAt: Date             // Plan creation timestamp
}
```

---

## Security Considerations

### Password Security
- Passwords are hashed using bcrypt with salt rounds of 10
- Plain text passwords are never stored or logged
- Password minimum length: 6 characters (enforced by validation)

### Token Security
- JWT tokens are signed with a secret key
- Tokens include user ID in payload
- Tokens expire after configured duration (default: 7 days)
- Use HTTPS in production to protect tokens in transit

### Authorization
- Users can only access their own plans
- Plan ownership is verified before any modification
- Attempting to access/modify other users' plans returns 403 Forbidden

### Input Validation
- All inputs are validated on the backend
- Mongoose schema validation provides additional data integrity
- SQL injection is not a concern (using MongoDB)

### Best Practices
1. Always use HTTPS in production
2. Store JWT_SECRET securely (never commit to version control)
3. Use strong, unique passwords
4. Implement rate limiting in production
5. Monitor for suspicious activity
6. Keep dependencies updated

---

## Support

For issues or questions:
- Check the [Backend README](./README.md) for setup instructions
- Review the [Environment Setup Guide](../ENVIRONMENT_SETUP.md)
- Check server logs for detailed error information

---

## Changelog

### Version 1.0.0 (Initial Release)
- User authentication (signup/login)
- JWT-based authorization
- CRUD operations for EMI calculation plans
- Indian currency formatting support
- Comprehensive error handling
