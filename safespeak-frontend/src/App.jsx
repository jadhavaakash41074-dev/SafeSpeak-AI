import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import Upload from './pages/Upload';
import Profile from './pages/Profile';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? children : <Navigate to="/" replace />;
}

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <BottomNav />
    </>
  );
}

export default function App() {
  const { token, logout } = useAuthStore();

  // On every app load — verify token is still valid
  useEffect(() => {
    if (!token) return;
    // Skip expiry check for mock tokens (no backend)
    if (token.startsWith('jwt_mock_')) return;
    // Check real JWT expiry
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && Date.now() / 1000 > payload.exp) {
        logout();
      }
    } catch {
      logout();
    }
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontSize: '14px',
            borderRadius: '12px',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: '700',
          },
          duration: 3000,
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Protected routes */}
        <Route path="/" element={
          <PrivateRoute><Layout><Feed /></Layout></PrivateRoute>
        } />
        <Route path="/upload" element={
          <PrivateRoute><Layout><Upload /></Layout></PrivateRoute>
        } />
        <Route path="/profile/:userId" element={
          <PrivateRoute><Layout><Profile /></Layout></PrivateRoute>
        } />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
