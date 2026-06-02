// This file acts as a mock API to fetch tour data.

const tourPackages = [
    { id: 1, name: 'Wild Safari Adventure in Yala', type: 'Wildlife', duration: '3 Days', price: 350, image: 'https://images.pexels.com/photos/1671239/pexels-photo-1671239.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', description: 'Experience the thrill of seeing leopards, elephants, and diverse birdlife in their natural habitat. Our expert guides will take you through the best spots in Yala National Park.', included: ['Park Entrance Fees', '4x4 Jeep Safari', 'Experienced Guide', '2 Nights Hotel Stay'] },
    { id: 2, name: 'Cultural Triangle Discovery', type: 'Cultural', duration: '5 Days', price: 550, image: 'https://images.pexels.com/photos/2402636/pexels-photo-2402636.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', description: 'Explore the ancient cities of Anuradhapura, Polonnaruwa, and the iconic Sigiriya rock fortress. This tour is a deep dive into Sri Lanka\'s rich history.', included: ['All Site Entrance Fees', 'Private A/C Vehicle', '4 Nights Hotel Stay', 'Certified Tour Guide'] },
    { id: 3, name: 'Hill Country Express', type: 'Adventure', duration: '4 Days', price: 420, image: 'https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', description: 'Journey through lush tea plantations, hike to stunning viewpoints like Little Adam\'s Peak, and ride the famous Kandy to Ella train.', included: ['Train Tickets', 'Tea Plantation Visit', 'Guided Hikes', '3 Nights Hotel Stay'] },
    { id: 4, name: 'Southern Coast Relaxation', type: 'Beach', duration: '7 Days', price: 700, image: 'https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', description: 'Unwind on golden beaches, visit the historic Galle Fort, and go whale watching in Mirissa. The perfect coastal getaway.', included: ['Whale Watching Tour', 'Galle Fort Tour', '6 Nights Beachfront Hotel', 'Airport Transfers'] },
    { id: 5, name: 'Kandy & Nuwara Eliya Escape', type: 'Cultural', duration: '3 Days', price: 300, image: 'https://images.pexels.com/photos/1603649/pexels-photo-1603649.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', description: 'Visit the Temple of the Tooth Relic in Kandy and experience the cool climates and colonial charm of Nuwara Eliya, "Little England".', included: ['Temple Entrance Fee', 'Visit to a Tea Factory', '2 Nights Hotel Stay', 'City Tours'] },
    { id: 6, name: 'East Coast Surfing Trip', type: 'Beach', duration: '5 Days', price: 480, image: 'https://images.pexels.com/photos/240526/pexels-photo-240526.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', description: 'Catch the perfect waves in Arugam Bay, a world-renowned destination for surfers of all levels. Includes surf lessons for beginners.', included: ['Surf Board Rental', '2 Surf Lessons', '4 Nights Guesthouse Stay', 'Beach BBQ'] },
];

// Function to get all tours (like on the main Tours page)
export const getTours = () => {
    return tourPackages;
};

// Function to get a single tour by its ID
export const getTourById = (id) => {
    // Find the tour with the matching ID. Note: IDs from URL are strings.
    return tourPackages.find(tour => tour.id === parseInt(id));
};