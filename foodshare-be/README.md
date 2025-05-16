# FoodShare Backend API

Backend API for the FoodShare platform - a community hub where users can post food donations or request meals.

## Description

This is a NestJS backend application for the FoodShare platform. It provides RESTful API endpoints for managing users, food posts (donations and requests), claims, ratings, and notifications.

## Technologies Used

- NestJS
- TypeORM
- PostgreSQL
- JWT Authentication
- Swagger API Documentation

## Installation

```bash
# Install dependencies
npm install

# Create .env file from example
cp env.example .env
# Then update the values as needed
```

## Running the app

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

## Database Setup

The application requires PostgreSQL. Make sure you have PostgreSQL installed and running, then update the database connection details in your `.env` file.

To populate the database with initial test data:

```bash
npm run seed
```

## API Documentation

Once the application is running, you can access the Swagger API documentation at:

```
http://localhost:3001/api/docs
```

## Environment Variables

The application uses the following environment variables that can be set in the `.env` file:

- `PORT`: The port on which the server runs (default: 3001)
- `NODE_ENV`: Application environment (development, production)
- `DB_HOST`: PostgreSQL host (default: localhost)
- `DB_PORT`: PostgreSQL port (default: 5432)
- `DB_USERNAME`: PostgreSQL username
- `DB_PASSWORD`: PostgreSQL password
- `DB_DATABASE`: PostgreSQL database name
- `JWT_SECRET`: Secret key for JWT token generation
- `JWT_EXPIRATION`: JWT token expiration time

## Deployment on Render

This project is configured for deployment on Render. When deploying:

1. Set environment variables in the Render dashboard
2. Use the following build command: `npm install && npm run build`
3. Use the following start command: `npm run start:prod` 