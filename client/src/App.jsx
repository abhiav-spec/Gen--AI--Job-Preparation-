import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import ThreeBackground from './components/ThreeBackground';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="relative min-h-screen">
          <ThreeBackground />
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
