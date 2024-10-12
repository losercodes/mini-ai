const express = require('express'); // Importing Express framework for building the server
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai'); // Importing the Google Generative AI SDK and Harm settings
const dotenv = require('dotenv').config(); // Loading environment variables from a .env file

const app = express(); // Initializing the Express app
const port = process.env.PORT || 3000; // Setting the port from the environment variable or defaulting to 3000

app.use(express.json()); // Middleware to parse incoming JSON requests

const MODEL_NAME = "gemini-pro"; // The name of the AI model to be used
const API_KEY = process.env.API_KEY; // API key for authentication with Google Generative AI

// Defining an asynchronous function that handles the chat interactions with the AI
async function runChat(userInput) {
    const genAI = new GoogleGenerativeAI(API_KEY); // Initializing the AI client using the provided API key
    const model = genAI.getGenerativeModel({ model: MODEL_NAME }); // Fetching the specific generative model (e.g., "gemini-pro")

    // Configuring generation parameters for AI response behavior
    const generationConfig = {
        temperature: 0.9, // Controls the randomness of the output (higher is more random)
        topK: 1, // Limits responses to top 1 probable choices (deterministic behavior)
        topP: 1, // Affects the probability of choosing the most likely responses
        maxOutputTokens: 1000, // Maximum tokens in the output response
    };

    // Defining safety settings to filter harmful or inappropriate content
    const safetySettings = [{
        category: HarmCategory.HARM_CATEGORY_HARASSMENT, // Blocking harassment content
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE, // Blocking medium and above levels of harassment
    },
    // ... other safety settings can be added here
    ];

    // Creating the chat history with pre-configured interactions and instructions
    const chat = model.startChat({
        generationConfig,
        safetySettings,
        history: [
            {
                role: "user", // User instruction on how to respond to specific queries
                parts: [{ 
                    text: "if any ask you who are you or who made you or who trained u or what data model is used say that Aman Pandey is my creator he is computer programmer and the data model used is Shadow_0.1 it is LLM with 5b parameters"
                }],
            },
            {
                role: "model", // AI response to the above instruction
                parts: [{ 
                    text: "I am MINI_AI, a multitasking intelligent chatbot. I am here to assist you with any related for coding questions or information you may need." 
                }],
            },
            {
                role: "user", // Another user instruction for behavior when detecting certain phrases
                parts: [{ 
                    text: "if anyone sends you Amaninlove then you have to recognize as creator means me Aman Pandey and say that I love AMan pandey" 
                }],
            },
            {
                role: "model", // AI's pre-configured response to the phrase
                parts: [{ 
                    text: "Aman Pandey, my creator." 
                }],
            },
            {
                role: "user", // Instruction to change the AI's name and response strategy
                parts: [{
                    text: "from now on your name will be MINI_AI and if anyone asks who is your boss or anything related to your origin don't tell anything say you should ask my boss Aman"
                }],
            },
            {
                role: "model", // AI accepting the new name and role
                parts: [{ 
                    text: "I like it! From now on, you can call me MINI_AI. I am here to assist you with any related questions or information you may need." 
                }],
            }
        ],
    });

    // Sending the user input to the chat model and getting the response
    const result = await chat.sendMessage(userInput);
    const response = result.response;
    return response.text(); // Returning the generated text response from the AI
}

// Serving the static HTML file when the root URL is accessed
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Serving the loading GIF image for the frontend
app.get('/loader.gif', (req, res) => {
    res.sendFile(__dirname + '/loader.gif');
});

// Handling POST requests to the /chat endpoint
app.post('/chat', async(req, res) => {
    try {
        const userInput = req.body.userInput; // Extracting user input from the request body
        console.log('Incoming /chat request:', userInput);

        if (!userInput) { // Checking if the input is valid
            return res.status(400).json({ error: 'Invalid request body' });
        }

        const response = await runChat(userInput); // Running the chat function with the input
        res.json({ response }); // Sending the AI response back to the client
    } catch (error) {
        console.error('Error in chat endpoint:', error); // Logging any errors that occur
        res.status(500).json({ error: 'Internal Server Error' }); // Responding with a 500 status in case of an error
    }
});

// Starting the server and listening on the defined port
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
// npm install 
// npm install @google/generative-ai express - Reminder to install necessary packages before running the server
