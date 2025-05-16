# FoodShare Platform

FoodShare is a community platform that connects people with surplus food to those in need, reducing food waste and fighting hunger through simple food sharing.

## Project Structure

This project consists of two main components:

### Frontend (foodshare-fe)

A Next.js web application that provides the user interface for the FoodShare platform.

- **Technologies**: Next.js, React, Tailwind CSS, TypeScript
- **Features**: User authentication, food donation/request posting, food map, claims management

### Backend (foodshare-be)

A NestJS API that serves as the backend for the FoodShare platform.

- **Technologies**: NestJS, TypeORM, PostgreSQL, JWT Authentication, Swagger
- **Features**: RESTful API endpoints for users, posts, claims, ratings, and notifications

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- npm or yarn

### Installation and Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/foodshare.git
   cd foodshare
   ```

2. Set up the backend:
   ```bash
   cd foodshare-be
   npm install
   cp env.example .env
   # Configure your .env file with PostgreSQL credentials
   npm run seed # Populate the database with initial data
   npm run start:dev
   ```

3. Set up the frontend:
   ```bash
   cd ../foodshare-fe
   npm install
   # Create and configure .env.local if needed
   npm run dev
   ```

4. Open your browser and navigate to:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - API Documentation: http://localhost:3001/api/docs

## Deployment

### Backend Deployment (Render)

1. Set up a PostgreSQL database on Render or use another provider
2. Configure environment variables in Render dashboard
3. Use the following build command: `npm install && npm run build`
4. Use the following start command: `npm run start:prod`

### Frontend Deployment

The frontend can be deployed to Vercel, Netlify, or any other Next.js-compatible hosting service.

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to all contributors and community members
- Special thanks to the food sharing community for inspiration