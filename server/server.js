const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const { getChatbotResponse } = require("./utils/gemini");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect("mongodb+srv://wealthwiseadmin:wealthwise2004@wealthwisedb.1wlhd.mongodb.net/?retryWrites=true&w=majority&appName=WealthwiseDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));

// Define schemas
const MessageSchema = new mongoose.Schema({
    userMessage: String,
    botResponse: String,
    timestamp: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true }
});

const Message = mongoose.model("Message", MessageSchema);
const User = mongoose.model("User", UserSchema);

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    debug: true,
});

// Function to send a welcome email
const sendWelcomeEmail = async (email) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Welcome to Financial AI Advisor',
        text: `Dear Valued User,

Thank you for signing up for Financial AI Advisor! We are excited to have you on board. Our AI-driven financial assistant is here to provide you with insights, guidance, and support for your financial journey.

Feel free to ask any questions related to investments, budgeting, savings, or any other financial topics. Our AI is designed to help you make informed decisions.

If you have any questions or need further assistance, don’t hesitate to reach out.

Best regards,  
Team Wealthwise`
    };
    await transporter.sendMail(mailOptions);
};

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

// API to handle chatbot messages
app.post("/api/chat", async (req, res) => {
    const { message } = req.body;
  
    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }
  
    try {
        const botReply = await getChatbotResponse(message);
        const newMessage = new Message({ userMessage: message, botResponse: botReply });
        await newMessage.save();
        res.json({ reply: botReply });
    } catch (error) {
        console.error("Chatbot Error:", error);
        res.status(500).json({ error: "Error processing request" });
    }
});

// API to save user email
app.post('/api/save-email', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(200).json({ message: 'Email already exists' });
        }

        const newUser = new User({ email });
        await newUser.save();
        res.json({ message: 'Email saved successfully' });
    } catch (error) {
        console.error('Error saving email:', error);
        res.status(500).json({ error: 'Error saving email' });
    }
});

// API route to send verification email
app.post('/api/auth/send-verification', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        await sendWelcomeEmail(email);
        res.json({ message: 'Login Successfully!' });
    } catch (error) {
        console.error('Email sending error:', error);
        res.status(500).json({ error: 'Failed to send verification email' });
    }
});

// Start server
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));





