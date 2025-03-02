const axios = require("axios");

const API_KEY = "AIzaSyCOSBhoo6TbEXgv3xeG8vU8zcebhg1ZXXM"; // Replace with your actual API Key
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent";

async function getChatbotResponse(userMessage) {
  try {
    const response = await axios.post(
      `${GEMINI_URL}?key=${API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: userMessage }]
          }
        ]
      },
      {
        headers: { "Content-Type": "application/json" }
      }
    );

    // Extract chatbot's reply
    return response.data.candidates[0]?.content?.parts[0]?.text || "No response from AI.";
  } catch (error) {
    console.error("Error in Gemini API:", error.response?.data || error.message);
    return "Sorry, I couldn't process your request.";
  }
}

module.exports = { getChatbotResponse };
