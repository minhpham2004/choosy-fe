Choosy Frontend

The Choosy Frontend is a React + TypeScript application built with Vite. It provides a fast and responsive user interface for the Choosy hobby-matching platform, allowing users to create profiles, upload photos, browse and swipe through matches, and interact with others. The application consumes APIs from the NestJS backend

Project Overview

The frontend follows a modular and component-driven structure to ensure scalability and maintainability. Each directory serves a distinct purpose, making the codebase organized and easy to extend.

src/
│
├── assets/                   # Static images, icons, and other media assets
├── components/               # Reusable small UI components (buttons, modals, inputs, etc.)
├── constants/                # Static values and configuration constants used across the app
├── hooks/                    # Custom React hooks for state and logic reuse
├── layouts/                  # Common layout components such as Navbar, Footer, or PageWrapper
├── lib/                      # Library setup files or helper utilities (e.g., API clients, validation)
├── pages/                    # Page-level components representing main app views (Home, Profile, Match, etc.)
├── routes/                   # Route definitions and navigation configuration
├── types/                    # TypeScript type definitions and shared interfaces
├── utils/                    # Utility functions (e.g., image upload, formatting helpers)
│
├── App.tsx                   # Root application component
├── App.css                   # Global CSS styles
├── main.tsx                  # Application entry point (renders the app)
├── axios-interceptor.ts      # Axios configuration and request/response interceptors
└── setupTests.ts             # Test environment setup for Vitest or React Testing Library


The app communicates with the backend API through environment-based configuration, ensuring flexibility across development and production environments.

Team Responsibilities
Team Member	Responsibilities
- Harry:	Chat interface and message UI components
- Minh:	Matching interface (swipe logic) and image upload integration
- Anthony:	Reporting interface and safety settings
- Nathan:	Authentication pages, account settings
- Rayan:	Profile creation, editing, and display pages

Frameworks and Libraries
- Frontend Framework: React (with Vite + TypeScript)
- UI Library: Material UI / Tailwind CSS
- Routing: React Router DOM
- Testing: Vitest
- Build Tool: Vite
- Image Hosting: Cloudinary (via backend API)

Environment Configuration
Before running the project, create a .env file in the frontend root directory with the following environment variables:
VITE_BACKEND_URL=http://localhost:8080
VITE_CLOUDINARY_NAME=dtmyz4wy0
VITE_CLOUDINARY_PRESET=choosy

Note: The backend URL should point to the running NestJS API.
Cloudinary credentials refer to the image hosting account used by the backend.


Steps to Run the Project
1. Install Dependencies
npm install

2. Run the Application
# Development mode
npm run dev

The app will start on http://localhost:5173 (default Vite port)

3. Build for Production (Optional)
npm run build
npm run preview

4. Run Tests (Optional)
npm run test


Notes for Tutor
- This is the frontend interface for the Choosy project.
- The application depends on the Choosy Backend API for authentication, matching, chat, and reporting functionality.
- Ensure the backend is running locally before starting the frontend to avoid CORS or connection errors.
- The project uses only local environment variables.