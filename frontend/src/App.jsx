import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

import Home from './pages/Home';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Register from './pages/Register';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import Directory from './pages/Directory';
import Profile from './pages/Profile';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Jobs from './pages/Jobs';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Mentorship from './pages/Mentorship';
import Membership from './pages/Membership';
import Admin from './pages/Admin';


import Messages from './pages/Messages';
import Notifications from './pages/Notifications';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* Public routes */}
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="register" element={<Register />} />
              <Route path="faq" element={<FAQ />} />
              <Route path="contact" element={<Contact />} />

              {/* Protected routes - require login */}
              <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="directory" element={<ProtectedRoute><Directory /></ProtectedRoute>} />
              <Route path="profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
              <Route path="events/:id" element={<ProtectedRoute><EventDetail /></ProtectedRoute>} />
              <Route path="jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
              <Route path="news" element={<ProtectedRoute><News /></ProtectedRoute>} />
              <Route path="news/:id" element={<ProtectedRoute><NewsDetail /></ProtectedRoute>} />
              <Route path="mentorship" element={<ProtectedRoute><Mentorship /></ProtectedRoute>} />
              <Route path="membership" element={<ProtectedRoute><Membership /></ProtectedRoute>} />
              <Route path="messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />

              <Route path="notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

              {/* Admin routes - require admin role */}
              <Route path="admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            </Route>
          </Routes>
        </Router>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
