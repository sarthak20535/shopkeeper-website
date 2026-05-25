import { Routes, Route } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import HomePage from './pages/HomePage';
import TabPage from './pages/TabPage';
import ContactPage from './pages/ContactPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <SettingsProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/category/:tabId" element={<TabPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </SettingsProvider>
  );
}
