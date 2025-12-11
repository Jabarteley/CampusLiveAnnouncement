# Campus Live Announcements

A modern digital noticeboard for universities and educational institutions, providing real-time updates and announcements with AI-powered summarization capabilities.

## 🌟 Features

- **Real-time announcements**: Updates refresh automatically every 30 seconds
- **AI-powered summarization**: Automatic generation of concise summaries using OpenAI GPT-4
- **Category-based organization**: Academic, Events, and General announcements
- **Image support**: Upload and display images with announcements
- **Modern glassmorphic UI**: Beautiful, transparent UI with smooth animations
- **Secure admin dashboard**: Protected content management system
- **Responsive design**: Works on all device sizes
- **Event date tracking**: Calendar integration for event announcements

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern component-based UI library
- **TypeScript**: Type-safe JavaScript with enhanced development experience
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework with custom configurations
- **Framer Motion**: Smooth animations and transitions
- **Wouter**: Lightweight routing solution
- **TanStack Query (React Query)**: Server state management and caching
- **Radix UI + shadcn/ui**: Accessible, customizable UI components
- **Lucide React**: Beautiful icon library
- **date-fns**: Date manipulation and formatting

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **TypeScript**: Type-safe server-side development
- **JSON-based storage**: Lightweight file-based database system
- **Express-session**: Session-based authentication management
- **bcrypt**: Password hashing and security
- **Multer**: File upload handling for images
- **OpenAI API**: AI-powered text summarization
- **Zod**: Schema validation for data integrity

### Development Tools
- **ESLint**: Code linting and quality
- **TypeScript**: Static type checking
- **Vitest**: Testing framework (if tests exist)

## 🏗️ Architecture

### Frontend Architecture
The frontend is a React-based single-page application with:
- Component-based architecture using functional React components
- State management with React hooks and TanStack Query for server state
- Shared schema definitions in the `shared` directory for type consistency between frontend and backend
- Client-side routing with Wouter for navigation

### Backend Architecture
The backend is a Node.js/Express server with:
- JSON file-based storage system for persistence (db.json)
- Modular design with separate files for app setup, routes, storage, and authentication
- Custom session-based authentication system
- API endpoints for announcements, authentication, and AI features

## 🔐 Authentication System

The application uses a custom session-based authentication system:

- **Default admin credentials**:
  - Username: `admin`
  - Password: `password123` (configurable via environment variables)

- **Session management**: Uses express-session with memory store, expires after 1 week
- **Protected routes**: All announcement creation/modification endpoints require authentication
- **Login endpoint**: `POST /api/login` validates credentials and creates session
- **Logout endpoint**: `POST /api/logout` destroys the session
- **User endpoint**: `GET /api/auth/user` returns current authenticated user

## 📡 API Endpoints

### Authentication
- `POST /api/login` - Authenticate user with username/password
- `POST /api/logout` - End user session
- `GET /api/auth/user` - Get current authenticated user

### Announcements
- `GET /api/announcements` - Get all announcements (public access)
- `GET /api/announcements/:id` - Get specific announcement (public access)
- `POST /api/announcements` - Create new announcement (admin only)
- `PUT /api/announcements/:id` - Update announcement (admin only)
- `DELETE /api/announcements/:id` - Delete announcement (admin only)

### AI Features
- `POST /api/summarize` - Generate AI summary of text (admin only)

### File Uploads
- Serves uploaded images from `/uploads` directory

## 🤖 AI Integration

The application integrates OpenAI for intelligent text summarization:

- **Automatic summarization**: Generated when creating announcements with content >200 characters
- **Manual summarization**: Button in admin dashboard to generate summaries on demand
- **API configuration**: Requires `OPENAI_API_KEY` environment variable
- **Fallback system**: Works without AI if API key is not provided

## 🎨 UI/UX Design

### Design Elements
- **Glassmorphic design**: Backdrop blur effects with transparency and depth
- **Responsive layout**: Adapts to all screen sizes using Tailwind CSS
- **Animated elements**: Smooth transitions with Framer Motion
- **Category-based styling**: Color-coded categories (Academic: Blue/Cyan, Events: Purple/Pink, General: Emerald/Teal)
- **Modern components**: Utilizes Radix UI and shadcn/ui for accessible UI elements

### User Experience Features
- **Search and filtering**: Live search and category filtering on noticeboard
- **Modal-based details**: Click announcements to see full details
- **Admin dashboard**: Statistics, CRUD operations, and content management
- **Landing page**: Animated background with feature highlights
- **Accessibility**: Proper ARIA labels and semantic HTML structure

## 🎯 Pages & Components

### Pages
- **Landing**: Welcome page with features overview
- **Noticeboard**: Public view of all announcements
- **Admin Dashboard**: Content management for administrators
- **Login**: Secure authentication page
- **Not Found**: Error page for invalid routes

### Key Components
- **Announcement Card**: Visual representation of each announcement
- **Announcement Detail Modal**: Expanded view with all details
- **Search Filter Bar**: Search and category filtering controls
- **UI Components**: Buttons, cards, inputs, etc. from shadcn/ui

## 🔧 Environment Variables

The application uses the following environment variables:

- `PORT`: Server port (defaults to 5000)
- `ADMIN_USERNAME`: Admin username (defaults to "admin")
- `ADMIN_PASSWORD`: Admin password (defaults to "password123")
- `ADMIN_PASSWORD_HASH`: Pre-hashed admin password (for production)
- `SESSION_SECRET`: Secret for session encryption (defaults to "default-session-secret-change-me")
- `OPENAI_API_KEY`: API key for OpenAI integration (optional)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CampusLiveAnnouncements
```

2. Install dependencies:
```bash
npm install
```

3. Set environment variables (optional, see defaults above):
```bash
# Create .env file
echo "ADMIN_USERNAME=admin" > .env
echo "ADMIN_PASSWORD=your_secure_password" >> .env
echo "SESSION_SECRET=your_secret_key" >> .env
echo "OPENAI_API_KEY=your_openai_key" >> .env
```

4. Start the development server:
```bash
npm run dev
```

5. The application will be available at `http://localhost:5000`

### Building for Production

```bash
# Build the frontend and backend
npm run build

# Start the production server
npm start
```

## 📁 Project Structure

```
CampusLiveAnnouncements/
├── client/                 # Frontend React application
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Shared utilities
│   │   ├── pages/          # Page components
│   │   ├── App.tsx         # Main application component
│   │   ├── main.tsx        # Entry point
│   │   └── index.css       # Global styles
├── server/                 # Backend Express application
│   ├── app.ts              # Express app setup
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Data persistence logic
│   ├── simpleAuth.ts       # Authentication system
│   ├── index.ts            # Development server
│   └── index-prod.ts       # Production server
├── shared/                 # Shared types and schemas
│   └── schema.ts           # TypeScript interfaces and Zod schemas
├── uploads/                # File upload storage
├── db.json                 # JSON database file
├── package.json            # Project dependencies and scripts
├── vite.config.ts          # Vite build configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, please contact the development team or open an issue in the GitHub repository.

---

## 🌐 Live Link

[Insert your live deployment URL here]

## 📷 Screenshots

Screenshots of the application can be found in the [screenshots](./screenshots/) folder.

## 📚 Documentation

Full API documentation and technical documentation can be found in the [docs](./docs/) folder.

## 📋 Presentation

The project presentation slide deck (PDF) is available in the [presentation](./presentation/) folder.

## 🎨 Color Palette

The color palette used in the application:

- **Primary Gradients**:
  - Academic: Blue to Cyan (`from-blue-500/20 to-cyan-500/20`)
  - Events: Purple to Pink (`from-purple-500/20 to-pink-500/20`)
  - General: Emerald to Teal (`from-emerald-500/20 to-teal-500/20`)

- **UI Colors**: Based on Tailwind CSS with custom theme extensions
- **Glassmorphic Elements**: Backdrop blur with 40% opacity white/gray backgrounds
- **Text Colors**: Varying opacity levels for hierarchy and readability
