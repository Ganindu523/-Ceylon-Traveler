// This file defines the navigation links for different user roles.

export const guestLinks = [
  { name: 'Home', path: '/' },
  { name: 'Destinations', path: '/destinations' },
  { name: 'Register', path: '/register' },
];

export const userLinks = [
  { name: 'Home', path: '/user_home' },
  { name: 'Plan Trip', path: '/plan-trip' },
  { name: 'Hotels', path: '/hotels' },
  { name: 'Guides', path: '/guides' },
  { name: 'Taxis', path: '/taxi' },
  { name: 'My Bookings', path: '/my-bookings' },
 { name: 'Destinations', path: '/destinations' },
{ name: 'AI Assistant', path: '/ai-assistant' },
   { name: 'My Profile', path: '/profile' },
  
  
];

export const hotelManagementLinks = [
  { name: 'Dashboard', path: '/hotel-admin/dashboard' },
  { name: 'Manage Bookings', path: '/hotel-admin/bookings' },
  { name: 'Room Management', path: '/hotel-admin/rooms' },
  { name: 'Hotel Details', path: '/hotel-admin/details' },
];

export const taxiManagementLinks = [
  { name: 'Dashboard', path: '/taxi-admin/dashboard' },
  { name: 'Trip Requests', path: '/taxi-admin/requests' },
  { name: 'Driver Management', path: '/taxi-admin/profile' },
 
];

export const guideManagementLinks = [
  { name: 'Dashboard', path: '/guide-admin/dashboard' },
  { name: 'Booking Requests', path: '/guide-admin/GuideBookingManager' },
  { name: 'Profile Settings', path: '/guide-admin/profile' },
];

export const adminDashboardLink = [
  { name: 'Dashboard', path: '/admin/dashboard' },
 
  { name: 'Trip Management', path: '/admin/trip-management' },
 
];