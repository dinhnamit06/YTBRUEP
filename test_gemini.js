const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // There is no easy "listModels" in the simple GenAI SDK without extra auth.
    // But we can try a simple request to confirm path.
    console.log("Testing Gemini Key...");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: "v1" });
        const result = await model.generateContent("Hi");
        console.log(result.response.text());
    } catch (e) {
        console.error(e);
    }
}

listModels();
