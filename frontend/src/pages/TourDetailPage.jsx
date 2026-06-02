import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTourById } from '../api/tours'; // Import our mock API function
import { FaClock, FaTag, FaCheckCircle } from 'react-icons/fa';

const TourDetailPage = () => {
  const { id } = useParams(); // Get the 'id' from the URL, e.g., "/tours/3" -> id is "3"
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the tour details when the component mounts
    const tourData = getTourById(id);
    setTour(tourData);
    setLoading(false);
  }, [id]); // Re-run this effect if the ID in the URL changes

  if (loading) {
    return <div className="text-center py-20"><h2>Loading tour details...</h2></div>;
  }

  if (!tour) {
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl font-bold text-red-600">Tour Not Found</h2>
        <p className="mt-4 text-gray-600">Sorry, we couldn't find the tour you're looking for.</p>
        <Link to="/tours" className="mt-6 inline-block bg-teal-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-600 transition-colors">
          &larr; Back to All Tours
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* 1. Image Banner Section */}
      <section 
        className="relative bg-cover bg-center h-96 flex items-end text-white"
        style={{ backgroundImage: `url(${tour.image})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="relative container mx-auto p-8">
          <h1 className="text-5xl font-extrabold">{tour.name}</h1>
          <p className="text-xl mt-2">{tour.type} Tour</p>
        </div>
      </section>

      {/* 2. Main Content Section */}
      <div className="container mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Side: Details & Description */}
        <div className="lg:col-span-2">
          <h2 className="text-3xl font-bold text-gray-800 border-b-2 border-teal-500 pb-2 mb-6">
            Tour Overview
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed">{tour.description}</p>
          
          <h3 className="text-2xl font-bold text-gray-800 mt-10 mb-4">What's Included</h3>
          <ul className="space-y-3">
            {tour.included.map((item, index) => (
              <li key={index} className="flex items-center text-gray-700">
                <FaCheckCircle className="text-green-500 mr-3" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Side: Booking Card */}
        <aside className="lg:col-span-1">
          <div className="bg-gray-50 p-6 rounded-lg shadow-lg sticky top-24">
            <h3 className="text-2xl font-bold text-center mb-6">Book This Tour</h3>
            <div className="space-y-4 text-lg">
              <div className="flex justify-between items-center">
                <span className="flex items-center font-semibold text-gray-700">
                  <FaClock className="mr-2 text-teal-500" /> Duration:
                </span>
                <span className="text-gray-800">{tour.duration}</span>
              </div>
              <hr />
              <div className="flex justify-between items-center">
                <span className="flex items-center font-semibold text-gray-700">
                  <FaTag className="mr-2 text-teal-500" /> Price:
                </span>
                <span className="font-bold text-2xl text-gray-900">${tour.price} <span className="text-sm font-normal">/ person</span></span>
              </div>
            </div>
            <button className="mt-8 w-full bg-teal-500 text-white font-bold py-4 px-4 rounded-lg text-lg hover:bg-teal-600 transition-colors duration-300">
              Book Now
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default TourDetailPage;