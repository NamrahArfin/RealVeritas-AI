import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '../layouts/MainLayout';
import DashLayout from '../layouts/DashLayout';

// Pages
import LandingPage from '../pages/Landing';
import Login from '../pages/Auth/Login';
import Signup from '../pages/Auth/Signup';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import Dashboard from '../pages/Dashboard';
import UploadMedia from '../pages/UploadMedia';
import ImageVerification from '../pages/ImageVerification';
import VideoVerification from '../pages/VideoVerification';
import AudioVerification from '../pages/AudioVerification';
import TextVerification from '../pages/TextVerification';
import Results from '../pages/Results';
import HistoryPage from '../pages/History';
import Analytics from '../pages/Analytics';
import ProfilePage from '../pages/Profile';
import SettingsPage from '../pages/Settings';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Private Pages (Dashboard Shell) */}
      <Route element={<DashLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<UploadMedia />} />
        <Route path="/image" element={<ImageVerification />} />
        <Route path="/video" element={<VideoVerification />} />
        <Route path="/audio" element={<AudioVerification />} />
        <Route path="/text" element={<TextVerification />} />
        <Route path="/results" element={<Results />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Catch-all Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
