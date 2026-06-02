import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { HelmetProvider, Helmet } from 'react-helmet-async';

// Component Imports
import Navbar from './components/Navbar';
import ChatWindow from './components/chat/ChatWindow';

// Page Imports
import HomePage from './pages/HomePage';
import DestinationsPage from './pages/DestinationsPage';
import ToursPage from './pages/ToursPage'; 
import TourDetailPage from './pages/TourDetailPage';
import LoginPage from './pages/Login'; 
import RegistrationPage from './pages/Register';
import HotelDashboard from './pages/HotelDashboard';
import RoomManagementPage from './pages/RoomManagementPage';
import TouristHotelDetails from './pages/TouristHotelDetails';
import HotelDetailsPage from './pages/HotelDetailsPage';
import BookingManagementPage from './pages/BookingManagementPage';
import HotelsPage from './pages/HotelsPage';
import GuidesPage from './pages/GuidesPage';
import TaxiPage from './pages/TaxiPage';
import ServiceDetailsPage from './pages/ServiceDetailsPage';
import TaxiDashboard from './pages/TaxiDashboard';
import DriverProfilePage from './pages/DriverProfilePage';
import GuideDashboard from './pages/GuideDashboard';
import GuideBookingManager from './pages/GuideBookingManager';
import GuideProfilePage from './pages/GuideProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import UserHomePage from './pages/UserHomePage';
import PlanTripPage from './pages/PlanTripPage';
import HotelBookingsPage from './pages/HotelBookingsPage';
import TaxiRequestsPage from './pages/TaxiRequestsPage';  
import AdminApprovalsPage from './pages/AdminApprovalsPage';
import ManageAdminsPage from './pages/ManageAdminsPage';
import TripManagementPage from './pages/TripManagementPage';
import TouristProfilePage from './pages/TouristProfilePage';
import AIAssistant from './pages/AIAssistant';

// Import the link configurations
import { 
  guestLinks, 
  userLinks, 
  hotelManagementLinks, 
  taxiManagementLinks,
  guideManagementLinks,
  adminDashboardLink  
} from './navLinks';

const UserDashboard = () => <div className="p-8"><h2>Tourist Dashboard</h2></div>; 

const getUserRole = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return 'guest';
  }
  try {
    const decodedToken = jwtDecode(token);
    return decodedToken.user.role || 'guest';
  } catch (error) {
    console.error("Invalid token:", error);
    localStorage.removeItem('token');
    return 'guest';
  }
};

function AppContent() {
  const _location = useLocation(); 
  const userRole = getUserRole(); 

  const getNavLinks = () => {
    switch (userRole) {
      case 'tourist':
        return userLinks;
      case 'hotel':
        return hotelManagementLinks;
      case 'admin':
        return adminDashboardLink;
      case 'taxi':
        return taxiManagementLinks;
      case 'guide':
        return guideManagementLinks;
      default:
        return guestLinks;
    }
  };

  return (
    <>
      <Navbar navLinks={getNavLinks()} userRole={userRole} />
      <main className="pt-24 md:pt-28 lg:pt-32 min-h-screen">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage/>} />
          <Route path="/destinations" element={<DestinationsPage />} />
          <Route path="/tours" element={<ToursPage />} />
          <Route path="/tours/:id" element={<TourDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/hotels/:id" element={<TouristHotelDetails />} />

          {/* Dashboard Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/hotel-admin/dashboard" element={<HotelDashboard />} />
          <Route path="/taxi-admin/dashboard" element={<TaxiDashboard />} />
          <Route path="/guide-admin/dashboard" element={<GuideDashboard />} />

          {/* Hotel Routes */}
          <Route path="/hotel-admin/rooms" element={<RoomManagementPage />} /> 
          <Route path="/hotel-admin/details" element={<HotelDetailsPage />} />
          <Route path="/hotel-admin/bookings" element={<HotelBookingsPage />} />

          {/* Taxi Routes */}
          <Route path="/taxi-admin/profile" element={<DriverProfilePage />} />
          <Route path="/taxi-admin/requests" element={<TaxiRequestsPage />} />

          {/* Guide Routes */}
          <Route path="/guide-admin/GuideBookingManager" element={<GuideBookingManager />} />
          <Route path="/guide-admin/profile" element={<GuideProfilePage />} />

          {/* User Home Page */}
          <Route path="/user_home" element={<UserHomePage />} />
          <Route path="/plan-trip" element={<PlanTripPage />} />
          <Route path="/my-bookings" element={<BookingManagementPage />} />
          <Route path="/hotels" element={<HotelsPage />} />
          <Route path="/guides" element={<GuidesPage />} />
          <Route path="/taxi" element={<TaxiPage />} />
          <Route path="/service/:type/:id" element={<ServiceDetailsPage />} />
          <Route path="/profile" element={<TouristProfilePage />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />

           {/* Admin Routes */}
          <Route path="/admin/manage-admins" element={<ManageAdminsPage />} />
          <Route path="/admin/trip-management" element={<TripManagementPage />} />
          <Route path="/admin/approvals" element={<AdminApprovalsPage />} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  const [activeChat, setActiveChat] = useState(null); // { id, name }

  useEffect(() => {
    const handleChatTrigger = (e) => setActiveChat(e.detail);
    window.addEventListener('openChat', handleChatTrigger);
    return () => window.removeEventListener('openChat', handleChatTrigger);
  }, []);

  const token = localStorage.getItem('token');
  let currentUser = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      currentUser = { id: decoded.user.id, name: decoded.user.name };
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <HelmetProvider>
      <Helmet>
        <title>Ceylon Traveler | Luxury Sri Lankan Experiences</title>
        <meta name="description" content="Discover the magic of Sri Lanka with personalized tours, luxury hotels, and expert local guides." />
      </Helmet>
      <Router>
        <AppContent />
        {activeChat && currentUser && (
          <ChatWindow 
            currentUser={currentUser}
            receiver={activeChat}
            onClose={() => setActiveChat(null)}
          />
        )}
      </Router>
    </HelmetProvider>
  );
}

export default App;