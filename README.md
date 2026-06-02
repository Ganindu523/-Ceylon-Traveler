🌴 Ceylon Traveler
MERN Stack Gemini AI

Ceylon Traveler is a premium, full-stack tourism management platform designed to connect tourists with local hotels, taxis, and guides in Sri Lanka. Built with a focus on high-end UX and intelligent features, the platform serves as a comprehensive travel companion.

✨ Key Features
Luxury UI/UX: A fully responsive, glassmorphic design system utilizing Tailwind CSS and Framer Motion for smooth animations and a premium feel.
Intelligent Recommendations: A custom recommendation engine utilizing user data and the Gemini AI to suggest personalized hotels and itineraries.
Real-Time Chat: Integrated Socket.io for instant, room-based communication between tourists and service providers.
Role-Based Dashboards: Distinct, secure workflows and interfaces for Tourists, Hotel Managers, Taxi Drivers, Guides, and System Administrators.
Automated Notifications: Luxury-themed automated email confirmations triggered via Nodemailer for booking events.
Production Optimized: Dynamic SEO management via react-helmet-async and secure environment configurations for Vercel/Render deployment.
🛠️ Tech Stack
Frontend:

React (Vite)
Tailwind CSS
Framer Motion (Animations)
React Router DOM
Socket.io-client
Backend:

Node.js & Express.js
MongoDB (Mongoose)
Socket.io (WebSockets)
JSON Web Tokens (JWT) & Bcrypt
Nodemailer
External Services:

Cloudinary (Image Hosting)
Google Gemini API (AI Assistant)
🚀 Getting Started
Prerequisites
Node.js (v18+)
MongoDB Atlas Account
Cloudinary Account
Installation
Clone the repository:

git clone https://github.com/Chamod-Tharusha-Alwis/Ceylon-Traveler.git

Install dependencies for both frontend and backend:
Bash cd ceylon-traveler/backend npm install

cd ../frontend npm install Set up environment variables: Create a .env file in the backend directory:

Code snippet PORT=5000 MONGO_URI=your_mongodb_connection_string JWT_SECRET=your_jwt_secret CLOUDINARY_CLOUD_NAME=your_cloud_name CLOUDINARY_API_KEY=your_api_key CLOUDINARY_API_SECRET=your_api_secret GEMINI_API_KEY=your_google_gemini_key EMAIL_USER=your_email@gmail.com EMAIL_PASS=your_gmail_app_password Create a .env file in the frontend directory:

Code snippet VITE_API_URL=http://localhost:5000 Run the application (Development):

Bash

Terminal 1 (Backend)
cd backend npm run dev

Terminal 2 (Frontend)
cd frontend npm run dev 👨‍💻 Author Chamod Tharusha Alwis

Software Engineering Intern | BSc (Hons) Data Science Student

LinkedIn Profile :- https://www.linkedin.com/in/chamod-alwis/

Portfolio Website :- chamodtharusha.com.lk
