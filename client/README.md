# Gen-AI Job Preparation - Frontend

This is the frontend for the **Gen-AI Job Preparation** platform, a premium AI-driven interview simulation and job readiness tool. It features immersive 3D environments, real-time AI interactions, and intelligent vision monitoring to provide a state-of-the-art interview experience.

## 🚀 Key Features

- **Neural Interview Simulation**: Interactive AI-led mock interviews with real-time text and speech processing.
- **Smart Vision Dashboard**: Real-time face detection, expression analysis, and confidence tracking using modern AI vision.
- **AI Voice Integration**: Seamless speech-to-text and text-to-speech capabilities for a natural conversation flow.
- **Comprehensive Reports**: Detailed post-interview analysis with performance metrics, behavior tracking, and AI-generated insights.
- **Report Generator**: Automated PDF/Web report generation for resume analysis and interview performance.
- **Premium Aesthetics**: A "Glassmorphism" design system with vibrant gradients, smooth animations, and interactive 3D elements.

## 🛠️ Technology Stack

- **Core**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **3D Graphics**: [Three.js](https://threejs.org/)
- **AI Vision**: [@vladmandic/face-api](https://github.com/vladmandic/face-api)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router 7](https://reactrouter.com/)
- **API Client**: [Axios](https://axios-http.com/)

## 📂 Project Structure

```text
client/
├── public/               # Public static assets
├── src/
│   ├── api/              # API services for backend communication
│   │   ├── auth.api.js       # Login, Register, Verification
│   │   ├── interview.api.js  # Report generation & analysis
│   │   └── mockInterview.api.js # Mock session management
│   ├── components/       # Component-based architecture
│   │   ├── dashboard/    # Sidebar, Stats, Report cards
│   │   ├── interview/    # VideoMonitor (Face-API integration)
│   │   └── ui/           # Shared UI (Buttons, Inputs, Loaders)
│   ├── context/          # React context for global state
│   ├── hooks/            # Custom hooks (e.g., useSpeech for AI Voice)
│   ├── pages/            # Core views and page layouts
│   ├── routes/           # React Router navigation logic
│   ├── utils/            # Helper functions and AI vision utilities
│   ├── App.jsx           # Main application entry point
│   ├── index.css         # Global styles & Tailwind directives
│   └── main.jsx          # React DOM initialization
├── tailwind.config.js    # Tailwind CSS configuration
└── vite.config.js        # Vite build configuration
```


## 🏁 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/gen-ai-job-prep.git
   cd gen-ai-job-prep/client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the `client` directory based on `.env.example`:
   ```bash
   VITE_API_URL=http://localhost:5000/api
   ```

### Running Locally

To start the development server:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

### Building for Production

To create an optimized production build:
```bash
npm run build
```
The output will be in the `dist` directory.

## 🌐 Deployment

The project is configured for deployment on **Netlify**. A `netlify.toml` file is included to handle client-side routing and environment configurations.

## 📄 License

This project is licensed under the MIT License.
