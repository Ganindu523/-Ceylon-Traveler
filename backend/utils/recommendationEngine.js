const Hotel = require('../models/Hotel');
const Trip = require('../models/Trip');

/**
 * Smart Recommendation Engine
 * Analyzes user's previous trip history and finds hotels with matching "themes" or "tags".
 */
const getRecommendations = async (userId) => {
    try {
        // 1. Fetch user's previous trips to understand their preferences
        const pastTrips = await Trip.find({ user: userId }).limit(10);
        
        if (!pastTrips || pastTrips.length === 0) {
            // Fallback: Return top-rated or popular hotels if no history exists
            return await Hotel.find({ isApproved: true }).limit(3);
        }

        // 2. Extract "Interest Tags" from past trips
        // We look at districts visited and amenities of hotels they chose
        let interests = [];
        pastTrips.forEach(trip => {
            trip.destinations.forEach(dest => {
                interests.push(dest.district);
                if (dest.hotelDetails && dest.hotelDetails.amenities) {
                    interests = [...interests, ...dest.hotelDetails.amenities];
                }
            });
        });

        // 3. Simple Content-Based Filtering:
        // Find hotels that match the most interests but haven't been visited yet
        const visitedHotelIds = pastTrips.flatMap(trip => trip.destinations.map(d => d.hotelId));
        
        const allHotels = await Hotel.find({ 
            _id: { $nin: visitedHotelIds },
            isApproved: true 
        });

        // Score hotels based on matches
        const scoredHotels = allHotels.map(hotel => {
            let score = 0;
            const hotelTags = [hotel.district, ...hotel.amenities];
            
            interests.forEach(tag => {
                if (hotelTags.includes(tag)) score += 1;
            });

            return { hotel, score };
        });

        // Sort by score and return top 3
        return scoredHotels
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map(item => item.hotel);

    } catch (error) {
        console.error('Recommendation Engine Error:', error);
        return [];
    }
};

module.exports = { getRecommendations };
