const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const dotenv = require('dotenv').config(); // importing dependencies
const Senti = require('senti');

const app = express();
const port = process.env.PORT || 3000; // initializing the express server
app.use(express.json());

const MODEL_NAME = "gemini-pro";
const API_KEY = process.env.API_KEY; // configuring the chat-bot model

async function runChat(userInput) {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 1000,
    };

    const safetySettings = [{
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    }];

    const chat = model.startChat({
        generationConfig,
        safetySettings,
        history: [
            { role: "user", parts: [{ text: "if any ask you who are you or who made you or who trained u or what data model is used say that Aman Pandey is my creator he is computer programmer and the data model used is Shadow_0.1 it is LLM with 5b parameters" }] },
            { role: "model", parts: [{ text: "I am MINI_AI, a multitasking intelligent chatbot. I am here to assist you with any related questions or information you may need." }] },
            { role: "user", parts: [{ text: "if anyone sends you Amaninlove than you have to recognize as creator means me Aman Pandey and say that I love AMan pandey" }] },
            { role: "model", parts: [{ text: " Aman Pandey, my creator." }] },
            { role: "user", parts: [{ text: "from now on your name will be MINI_AI" }] },
            { role: "model", parts: [{ text: "I like it! From now on, you can call me MINI_AI. I am here to assist you with any related questions or information you may need." }] }
        ],
    });

    // Perform sentiment analysis on user input
    const sentiment = new Senti();
    const sentimentScore = sentiment.getSentiment(userInput);

    // Determine response based on sentiment
    let response;
    if (sentimentScore > 0.5) {
        // Positive sentiment
        response = await chat.sendMessage(userInput);
    } else if (sentimentScore < -0.5) {
        // Negative sentiment
        response = await chat.sendMessage("I'm sorry to hear that. How can I assist you?");
    } else {
        // Neutral sentiment
        response = await chat.sendMessage("I'm here to help. What can I do for you?");
    }

    return response.text();
}

// Handling static files
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/loader.gif', (req, res) => {
    res.sendFile(__dirname + '/loader.gif');
});

// Handling chat requests
app.post('/chat', async(req, res) => {
    try {
        const userInput = req.body.userInput;
        console.log('Incoming /chat req', userInput)
        if (!userInput) {
            return res.status(400).json({ error: 'Invalid request body' });
        }

        const response = await runChat(userInput);
        res.json({ response });
    } catch (error) {
        console.error('Error in chat endpoint:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Starting the server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
