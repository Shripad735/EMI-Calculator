# EMI Calculator Backend

Node.js/Express backend API for the EMI Calculator India application.

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
   - Set your MongoDB Atlas connection string
   - Set a secure JWT secret
   - Configure allowed CORS origins

4. Start the development server:
```bash
npm run dev
```

5. Run tests:
```bash
npm test
```

## Environment Variables

The backend requires several environment variables for proper operation. Create a `.env` file in the root directory based on `.env.example`.

### Required Variables

| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| `PORT` | Server port number | No | `5000` | `5000` |
| `NODE_ENV` | Environment mode | No | `development` | `development` or `production` |
| `MONGODB_URI` | MongoDB Atlas connection string | **Yes** | - | `mongodb+srv://user:pass@cluster.mongodb.net/emi-calculator` |
| `JWT_SECRET` | Secret key for JWT token generation | **Yes** | - | Use a strong random string (min 32 chars) |
| `JWT_EXPIRES_IN` | JWT token expiration time | No | `7d` | `7d`, `24h`, `30m` |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | No | `*` | `http://localhost:19000,http://localhost:19006` |

### Security Requirements

**⚠️ IMPORTANT:** The following variables MUST be changed before deploying to production:

1. **MONGODB_URI**: Use your actual MongoDB Atlas connection string
   - Create a cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a database user with appropriate permissions
   - Whitelist your server's IP address
   - Replace `username`, `password`, and `cluster` with your actual values

2. **JWT_SECRET**: Generate a strong, random secret
   ```bash
   # Generate a secure secret using Node.js
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   - Use the generated string as your JWT_SECRET
   - Never commit this secret to version control
   - Use different secrets for development and production

3. **ALLOWED_ORIGINS**: Specify exact frontend URLs
   - For development: `http://localhost:19000,http://localhost:19006`
   - For production: `https://your-frontend-domain.com`
   - Never use `*` in production

### Configuration for Different Environments

**Development:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://devuser:devpass@dev-cluster.mongodb.net/emi-calculator-dev
JWT_SECRET=dev-secret-key-min-32-characters-long
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=http://localhost:19000,http://localhost:19006
```

**Production:**
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://produser:prodpass@prod-cluster.mongodb.net/emi-calculator
JWT_SECRET=<generated-secure-random-string>
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=https://your-app-domain.com
```

### Validation

The application validates required environment variables on startup:
- If `MONGODB_URI` is missing, the server will fail to start
- If `JWT_SECRET` is missing, authentication endpoints will throw errors
- Check server logs for any configuration errors

## API Endpoints

For comprehensive API documentation including request/response examples, error handling, and authentication details, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

### Quick Reference

**Authentication:**
- `POST /auth/signup` - Create new user account
- `POST /auth/login` - Authenticate user

**Plans (Protected):**
- `GET /plans` - Get all user's saved plans
- `POST /plans` - Save a new EMI calculation
- `DELETE /plans/:id` - Delete a saved plan

## Project Structure

```
emi-calculator-backend/
├── src/
│   ├── config/         # Database configuration
│   ├── models/         # Mongoose models
│   ├── controllers/    # Route controllers
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   └── utils/          # Utility functions
├── __tests__/          # Test files
├── server.js           # Entry point
├── Procfile            # Heroku deployment configuration
├── railway.json        # Railway deployment configuration
└── package.json
```

## Deployment

This backend can be deployed to various platforms. The project includes configuration files for Railway and Heroku.

### Quick Deployment

**Railway:**
```bash
railway init
railway up
```

**Heroku:**
```bash
heroku create your-app-name
git push heroku main
```

### Environment Variables for Production

When deploying, ensure all environment variables are configured on your platform:

1. **Railway:** Set variables in the Railway dashboard or use `railway variables`
2. **Heroku:** Use `heroku config:set VARIABLE_NAME=value`

Required variables:
- `NODE_ENV=production`
- `MONGODB_URI` (your MongoDB Atlas connection string)
- `JWT_SECRET` (strong random string)
- `JWT_EXPIRES_IN=7d`
- `ALLOWED_ORIGINS` (your frontend URLs)

### MongoDB Atlas Configuration

1. Whitelist deployment platform IPs:
   - Railway: Add `0.0.0.0/0` or specific Railway IPs
   - Heroku: Add `0.0.0.0/0` or specific Heroku IPs

2. Ensure database user has read/write permissions

3. Test connection string before deploying

### Post-Deployment

1. Verify the backend is running: `curl https://your-backend-url.com/health`
2. Check logs for any errors
3. Test API endpoints with your frontend

For detailed deployment instructions, see the [Deployment Guide](../DEPLOYMENT_GUIDE.md) in the root directory.
