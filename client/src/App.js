import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/common/ThemeProvider';
import { GlobalStyles } from './styles/GlobalStyles';
import HomePage from './pages/HomePage';
import AnimePage from './pages/AnimePage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import VideoProgressDemo from './components/pages/VideoProgressDemo';
import DemoPage from './DemoPage';
import Header from './components/common/Header';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <GlobalStyles />
        <Router>
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/anime/:id" element={<AnimePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/video-progress-demo" element={<VideoProgressDemo />} />
            <Route path="/demo" element={<DemoPage />} />
          </Routes>
        </Router>
        <Toaster />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
