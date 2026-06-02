const mongoose = require('mongoose');
require('dotenv').config();

const Hotel = require('./models/Hotel');
const User = require('./models/User');

async function checkCounts() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ceylon-traveler');
        console.log('Connected to DB');

        const hotelCount = await Hotel.countDocuments();
        const guideCount = await User.countDocuments({ role: 'guide' });
        const taxiCount = await User.countDocuments({ role: 'taxi' });
        const approvedTaxiCount = await User.countDocuments({ role: 'taxi', isApproved: true });

        console.log('--- Database Stats ---');
        console.log(`Hotels: ${hotelCount}`);
        console.log(`Guides: ${guideCount}`);
        console.log(`Taxis (Total): ${taxiCount}`);
        console.log(`Taxis (Approved): ${approvedTaxiCount}`);

        const sampleHotel = await Hotel.findOne();
        console.log('\nSample Hotel:', sampleHotel ? { name: sampleHotel.name, district: sampleHotel.district, city: sampleHotel.city } : 'None');

        const sampleTaxi = await User.findOne({ role: 'taxi' });
        console.log('Sample Taxi:', sampleTaxi ? { name: sampleTaxi.name, isApproved: sampleTaxi.isApproved } : 'None');

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkCounts();
