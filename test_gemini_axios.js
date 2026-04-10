const axios = require('axios');
require('dotenv').config();

async function test() {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
    try {
        const res = await axios.post(url, {
            contents: [{ parts: [{ text: "Hi" }] }]
        });
        console.log("SUCCESS:", JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.error("ERROR:", e.response ? e.response.status : e.message);
        console.error("DATA:", JSON.stringify(e.response ? e.response.data : {}, null, 2));
    }
}
test();
