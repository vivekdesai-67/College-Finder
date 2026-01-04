🎓 College Finder

A modern college recommendation and management platform built with Next.js, TypeScript, Tailwind CSS, and MongoDB.
This application helps students explore, compare, and manage colleges while giving administrators powerful tools to manage data, users, and analytics.

------------------------------------------------------------
🚀 Features

STUDENT MODULE
- Browse and search for colleges by name, course, or location
- View detailed college information with ranking and reviews
- Create and manage a wishlist of preferred colleges
- Receive smart recommendations based on interests and preferences
- Secure authentication and profile management

ADMIN MODULE
- Admin dashboard for managing students and colleges
- Add, update, and delete college data
- View student statistics and analytics
- Manage users and authentication through APIs

GENERAL FEATURES
- Fully responsive UI with modern design (Tailwind CSS + shadcn/ui)
- API routes powered by Next.js App Router
- Integration with MongoDB for scalable data storage
- Token-based authentication (NextAuth / JWT)
- Component-based, reusable frontend structure

------------------------------------------------------------
🛠️ Tech Stack

Frontend: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
Backend: Next.js API Routes, Node.js
Database: MongoDB (Mongoose Models)
Auth: JWT / NextAuth
UI Components: Lucide Icons, Recharts, Custom React Hooks

------------------------------------------------------------
⚙️ Installation & Setup

1. Clone the repository
   git clone https://github.com/vivekdesai-67/College-Finder.git
   cd College-Finder

2. Install dependencies
   npm install

3. Create environment variables
   cp .env.example .env.local
   (Then fill in your MongoDB URI, JWT secret, etc.)

4. Run the development server
   npm run dev

App runs on http://localhost:3000

------------------------------------------------------------
🌍 Environment Variables

Create a .env.local file in the root directory:

MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_API_URL=http://localhost:3000

------------------------------------------------------------
📁 Folder Structure

college-Finder/
│-- app/
│   │-- api/ (All API routes: admin, student, auth)
│   │-- admin-dashboard/
│   │-- dashboard/
│   │-- explore/
│   └-- ... (Other pages)
│-- components/ (Reusable UI components)
│-- lib/ (Utility functions, DB models)
│-- types/ (TypeScript interfaces)
│-- public/ (Static assets)
│-- tailwind.config.ts
│-- next.config.js

------------------------------------------------------------
🧩 API Overview

/api/admin/colleges - Manage college records
/api/admin/students - Manage student data
/api/auth/login - User login
/api/auth/register - User registration
/api/recommendations - Generate college recommendations

------------------------------------------------------------
📈 Future Enhancements

- AI-based recommendation system
- College comparison feature
- Improved analytics for admins
- Email notifications and user onboarding
- Integration with external college ranking APIs

------------------------------------------------------------
👨‍💻 Author

Vivek Desai
GitHub: https://github.com/vivekdesai-67
Project: https://github.com/vivekdesai-67/College-Finder

------------------------------------------------------------
🪪 License

This project is licensed under the MIT License.
You’re free to use, modify, and distribute this software with proper attribution.

------------------------------------------------------------
"Empowering students to make informed college choices with data-driven insights."
