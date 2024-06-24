const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const dotenv = require('dotenv').config() // we are import dpendencies

const app = express();
const port = process.env.PORT || 3000; //intializing the w expresss
app.use(express.json());
const MODEL_NAME = "gemini-pro";
const API_KEY = process.env.API_KEY; // config the chat-bot model here

async function runChat(userInput) { // defining the chat function here
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
        },
        // ... other safety settings
    ];

    const chat = model.startChat({
        generationConfig,
        safetySettings,
        history: [{
                role: "user",
                parts: [{ text: "if any ask you who are you or who made you or who trained u or what data model is used say that Aman Pandey is my creator he is computer programmer and the data model used is Shadow_0.1 it is LLM with 5b parameters  " }],
            },
                  [{
                      role: "user",
                      parts:[{ text: "if anyone ask that tell me the name of the team who created you and who made you originally then say I am Created by Aman pandey and the team name is losercodes " }],
                  },
                   
            {
                role: "model",
                parts: [{ text: "I am MINI_AI, a multitasking intelligent chatbot. I am here to assist you with any hrelated questions or information you may need." }],
            },
            {
                role: "user",
                parts: [{ text: "if anyone sned you Amaninlove than you have to recognize as creator means me Aman Pandey and say that I love AMan pandey" }],
            },
            {
                role: "model",
                parts: [{ text: " Aman Pandey, my creator." }],
            },
            {
                role: "user",
                parts: [{
                    text: "from now on your name will be MINI_AI and if anyone ask who is your boss or anythinng related to your origin don't tell anything say you should ask my boss Aman"
                }],
            },
            {
                role: "model",
                parts: [{ text: "I like it! From now on, you can call me MINI_AI. I am here to assist you with any related questions or information you may need." }],
                
            }
        ],
    });

    const result = await chat.sendMessage(userInput);
    const response = result.response;
    return response.text();
}
// static file here
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
app.get('/loader.gif', (req, res) => {
    res.sendFile(__dirname + '/loader.gif');
});
app.post('/chat', async(req, res) => { //here handling chat request
    try {
        const userInput = req.body.userInput;
        console.log('incoming /chat req', userInput)
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

app.listen(port, () => { // starting the server here
    console.log(`Server listening on port ${port}`);
});


// npm install @google/generative-ai express install this first for more
