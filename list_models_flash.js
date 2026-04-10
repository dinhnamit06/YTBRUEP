const axios = require('axios');
require('dotenv').config();

async function list() {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    try {
        const res = await axios.get(url);
        res.data.models.forEach(m => {
            if (m.name.includes('flash')) {
                console.log(m.name);
            }
        });
    } catch (e) {
        console.error("ERROR:", e.response ? e.response.status : e.message);
    }
}
list();
