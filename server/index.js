const express = require('express');
const nodemailer = require('nodemailer');
const { Configuration, OpenAIApi } = require("openai");
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000; // Use the PORT environment variable if available

app.use(cors()); 
app.use(bodyParser.json());

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'YOUR_EMAIL_SERVICE', // e.g., 'Gmail'
  auth: {
    user: 'YOUR_EMAIL_ADDRESS',
    pass: 'YOUR_EMAIL_PASSWORD'
  }
});

// Configure OpenAI
const configuration = new Configuration({
  apiKey: 'YOUR_OPENAI_API_KEY',
});
const openai = new OpenAIApi(configuration);

// Welcome Email Route (triggered from your index.html form)
app.post('/send-welcome-email', (req, res) => {
  const { email } = req.body;

  const mailOptions = {
    from: 'YOUR_EMAIL_ADDRESS',
    to: email,
    subject: 'Welcome to FinBot!',
    text: 'Thank you for signing up for FinBot! We are excited to help you with your financial journey.'
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).send('Error sending email');
    } else {
      console.log('Email sent: ' + info.response);
      res.send('Email sent successfully!');
    }
  });
});

// OpenAI Chat Route (triggered from your aichat.html)
app.post('/get-chat-response', async (req, res) => {
  const { userMessage, chatHistory } = req.body;

  try {
    // Format chat history for OpenAI
    const messages = chatHistory.map(message => ({
      role: message.sender === 'user' ? 'user' : 'assistant',
      content: message.content
    }));
    messages.push({ role: 'user', content: userMessage }); // Add the latest user message

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo", // You can use other models as well
      messages: messages
    });

    const botReply = completion.data.choices[0].message.content;
    res.send({ botReply });

  } catch (error) {
    console.error(error);
    res.status(500).send('Error getting response from OpenAI');
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});