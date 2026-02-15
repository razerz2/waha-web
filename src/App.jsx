import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DashboardHome from './pages/DashboardHome';
import SessionPage from './pages/SessionPage';
import SessionControlPage from './pages/SessionControlPage';
import ProfilePage from './pages/ProfilePage';
import SendMessagePage from './pages/SendMessagePage';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="session" element={<SessionPage />} />
            <Route path="sessions/:sessionId" element={<SessionControlPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="send" element={<SendMessagePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
