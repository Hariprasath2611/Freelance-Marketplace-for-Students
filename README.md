# GradGigs - Freelance Marketplace for Students

A modern, production-ready freelance marketplace designed specifically for university students and fresh graduates. Students can showcase projects, analyze resumes with AI, calculate profile scores, bid on listings, and collaborate in real-time milestone workspaces.

---

## Technical Stack

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS (with custom themes)
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Real-time Sockets**: Socket.io Client

### Backend
- **Engine**: Node.js & Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT token authorization and Bcrypt hashing
- **File Uploads**: Multer
- **AI Integrations**: Gemini API (with smart fallback engines)
- **Real-time Sockets**: Socket.io

---

## Directory Structure

```bash
Freelance-Marketplace-for-Students/
├── backend/            # Express Node Server, schemas & AI configurations
│   ├── config/         # MongoDB setup
│   ├── controllers/    # API controllers
│   ├── middleware/     # JWT, multer upload logic
│   ├── models/         # User, Project, Proposals, Message, Payment schemas
│   ├── routes/         # Router endpoints
│   ├── services/       # AI proposal cover and resume parser matching
│   ├── sockets/        # Socket.io chat handlers
│   └── server.js       # Core entry point
└── frontend/           # React Client (Vite, Tailwind, CSS glassmorphism)
    ├── src/
    │   ├── components/ # Navigation Navbar and Footer
    │   ├── context/    # Auth, Theme and Socket handlers
    │   ├── pages/      # Home, Dashboard, Workspace, Real-time Chat
    │   └── App.jsx     # Main routes configuration
```

---

## Local Installation & Run Guide

### 1. Database Setup
Ensure you have MongoDB running locally, or prepare a MongoDB Atlas URI string.
- Local default: `mongodb://127.0.0.1:27017/freelance-student-marketplace`

### 2. Configure Environment Variables
Inside the `backend/` directory, create a `.env` file (refer to `backend/.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/freelance-student-marketplace
JWT_SECRET=super_secret_jwt_key
GEMINI_API_KEY=your_gemini_api_key_here
```
*(If no `GEMINI_API_KEY` is provided, the platform automatically switches to a smart local text parsing and rule-matching fallback engine for all AI features.)*

### 3. Startup the Backend Server
```bash
cd backend
npm install
npm run dev
```
The server will boot on `http://localhost:5000`.

### 4. Startup the Frontend Client
```bash
cd ../frontend
npm install
npm run dev
```
Vite will serve the frontend client on `http://localhost:5173`. Open it in your browser!

---

## Advanced AI Features

1. **AI Proposal Cover Letter Generator**: Integrated inside the project bidding modal. Uses the Gemini model (or local fallback) to write structured, custom, professional covers highlighting student capabilities against job postings.
2. **AI Skill Match Index**: Automatically reviews required skills for a gig against student profile skills, yielding percentage fits and detailed suitability lists.
3. **AI Resume Parser**: Accepts uploaded PDF/Word/Text resumes, parses content keywords, appends newly found skills to profiles, and gives feedback improvements.
4. **AI Portfolio Completeness Score**: Rates the portfolio items (variety, code links, live demo pages) out of 100 with checklist recommendations.
