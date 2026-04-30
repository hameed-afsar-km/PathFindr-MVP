# 🚀 PathFindr MVP — Multi-Tenant ERP SaaS Platform

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Shadcn UI](https://img.shields.io/badge/Shadcn_UI-000000?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

PathFindr is a sophisticated, multi-tenant Educational Resource Planning (ERP) SaaS platform designed to bridge the gap between educational institutes and students. Built with a focus on modern aesthetics, scalability, and AI-driven insights.

---

## ✨ Key Features

### 🏢 Multi-Tenancy & White-Labeling
- **Dynamic Theming**: Institutes can choose from predefined premium themes (Cosmic Purple, Deep Ocean, Neon Forest, etc.).
- **Custom Branding**: Full white-label support including logo initials and custom slugs.
- **Feature Toggling**: Super admins can authorize specific features per institute (Roadmaps, Practice, Chatbot, etc.).

### 📊 Comprehensive Dashboards
- **Admin Dashboard**: Global overview of all institutes, user management, and platform analytics.
- **Institute Dashboard**: Student management, performance tracking, announcement broadcasting, and feature configuration.
- **Student Portal**: Personalized experience with roadmaps, XP tracking, streaks, and course management.

### 🤖 AI Integration
- **Gemini Powered**: Built-in integration with Google Generative AI for smart roadmaps and interactive learning assistants.

### 📈 Advanced Data Visualization
- **Performance Analytics**: Real-time charts for student enrollment, activity levels, and course progress using Recharts.

### 📁 Data Management
- **Bulk Import/Export**: Support for CSV and Excel (XLSX) processing for student data.
- **Persistence**: Robust local storage synchronization for MVP state management.

---

## 🛠️ Tech Stack

- **Frontend**: React 18 (Hooks, Context API)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + `tailwindcss-animate`
- **UI Components**: Shadcn/UI (Radix UI)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **Data Fetching**: TanStack Query (React Query)
- **Charts**: Recharts
- **Import/Export**: PapaParse & XLSX
- **Testing**: Vitest & Playwright

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Bun (Optional, recommended for performance)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd PathFindr-MVP
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or if using bun
   bun install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   bun run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

---

## 📂 Project Structure

```text
src/
├── components/     # Reusable UI components (Shadcn + Custom)
├── context/        # Global state (AppContext, ThemeContext)
├── hooks/          # Custom React hooks
├── lib/            # Utility functions and library configurations
├── pages/          # Application routes (Admin, Institute, Student)
├── types/          # TypeScript definitions and schemas
└── utils/          # Helper functions
```

---

## 🧪 Testing

The project includes both unit and end-to-end tests:

- **Unit/Integration**: `npm run test` (Vitest)
- **E2E**: `npx playwright test`

---

## 🎨 Design Philosophy

PathFindr follows a **Glassmorphic** and **High-Contrast** design language, ensuring that the interface feels premium and modern. Every interaction is enhanced with subtle micro-animations using Framer Motion to provide a fluid user experience.

---

## 📄 License

This project is licensed under the MIT License.

---

Developed with ❤️ for the future of education.
