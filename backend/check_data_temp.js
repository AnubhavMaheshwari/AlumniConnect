const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: 'c:/Users/Anubhav/Desktop/AlumniConnect/backend/.env' });

const Event = require('c:/Users/Anubhav/Desktop/AlumniConnect/backend/models/Event');
const News = require('c:/Users/Anubhav/Desktop/AlumniConnect/backend/models/News');

async function checkData() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected ✅');

        const eventCount = await Event.countDocuments();
        const newsCount = await News.countDocuments();
        const publishedNewsCount = await News.countDocuments({ isPublished: true });

        const fs = require('fs');
        const results = `
Event Count: ${eventCount}
News Count: ${newsCount}
Published News Count: ${publishedNewsCount}
`;
        fs.writeFileSync('check_results.txt', results);
        console.log('Results written to check_results.txt');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkData();
