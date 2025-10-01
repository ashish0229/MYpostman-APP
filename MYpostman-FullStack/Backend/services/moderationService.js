require('dotenv').config();
const axios = require('axios');

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
// Updated model name to a valid, current model
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GOOGLE_API_KEY}`;

// A simple classification function based on keywords
const classifyContent = (text) => {
    const lowercasedText = text.toLowerCase();
    if (lowercasedText.includes('sale') || lowercasedText.includes('discount') || lowercasedText.includes('buy now')) {
        return { classification: 'approved', reason: 'Contains promotional content.' };
    }
    if (lowercasedText.length < 15) {
        return { classification: 'quarantined', reason: 'Content is too short, may lack substance.' };
    }
    return { classification: 'approved', reason: 'Content appears safe and meets basic criteria.' };
};


exports.analyzeContent = async (prompt) => {
    console.log("🧠 Calling AI moderation service with prompt...");
    try {
        const payload = {
            contents: [{
                parts: [{ text: prompt }]
            }]
        };
        const { data } = await axios.post(GEMINI_API_URL, payload, {
            headers: { 'Content-Type': 'application/json' }
        });

        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        // Use the simple keyword classification on the generated text
        const moderationResult = classifyContent(generatedText);

        console.log("🤖 AI Moderation Result:", moderationResult);
        return {
            ...moderationResult,
            generatedText: generatedText // Also return the generated text itself
        };

    } catch (error) {
        console.error("Error during AI content analysis:", error.response ? error.response.data : error.message);
        return {
            classification: 'quarantined',
            reason: 'An error occurred during AI analysis. Post has been quarantined for manual review.',
            generatedText: prompt // Return original prompt as fallback
        };
    }
};

