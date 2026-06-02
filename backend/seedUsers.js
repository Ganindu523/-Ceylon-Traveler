const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const users = [
    {
        name: 'System Admin',
        email: 'admin@ceylon.com',
        password: 'password123',
        role: 'admin',
        identificationNumber: 'ADM-001',
        isApproved: true
    },
    {
        name: 'Happy Tourist',
        email: 'tourist@gmail.com',
        password: 'password123',
        role: 'tourist',
        identificationNumber: 'TR-001',
        isApproved: true
    },
    {
        name: 'Luxury Hotel Manager',
        email: 'hotel@ceylon.com',
        password: 'password123',
        role: 'hotel',
        identificationNumber: 'HM-001',
        isApproved: false // Set to false to test Admin approval flow
    },
    {
        name: 'Safe Taxi Driver',
        email: 'taxi@ceylon.com',
        password: 'password123',
        role: 'taxi',
        identificationNumber: 'TX-001',
        isApproved: false
    },
    {
        name: 'Expert Local Guide',
        email: 'guide@ceylon.com',
        password: 'password123',
        role: 'guide',
        identificationNumber: 'GD-001',
        isApproved: false
    }
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding... 🚀');

        for (let userData of users) {
            // Check if user already exists
            const existingUser = await User.findOne({ email: userData.email });
            if (existingUser) {
                console.log(`User ${userData.email} already exists, skipping...`);
                continue;
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            userData.password = await bcrypt.hash(userData.password, salt);

            // Create user
            const newUser = new User(userData);
            await newUser.save();
            console.log(`✅ Created ${userData.role}: ${userData.email}`);
        }

        console.log('\nDatabase Seeding Completed! 🎉');
        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
