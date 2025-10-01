require('dotenv').config();
const axios = require('axios');

const UNSPLASH_API_KEY = process.env.UNSPLASH_API_KEY;
const UNSPLASH_API_URL = 'https://api.unsplash.com/photos/random';

exports.fetchImage = async (query) => {
    // Check if the API key is missing
    if (!UNSPLASH_API_KEY) {
        console.error("❌ Unsplash API key is missing. Please check your .env file.");
        // Return a specific placeholder if the key is missing
        return `https://placehold.co/600x400/FEE140/000000?text=Unsplash+API+Key+Missing`;
    }

    try {
        const response = await axios.get(UNSPLASH_API_URL, {
            headers: {
                'Authorization': `Client-ID ${UNSPLASH_API_KEY}`
            },
            params: {
                query: query,
                orientation: 'landscape'
            }
        });
        // Return the regular-sized image URL
        return response.data.urls.regular;
    } catch (error) {
        // Log a more detailed error message
        console.error("❌ Error fetching image from Unsplash:", error.response ? error.response.data : error.message);
        // Return a generic fallback image if the API call fails for other reasons
        return `https://placehold.co/600x400/cccccc/000000?text=Image+Fetch+Failed`;
    }
};
