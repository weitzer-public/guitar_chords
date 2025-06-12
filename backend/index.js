// backend/index.js
const express = require('express');
const fs = require('fs/promises');
const nodePath = require('path'); // Ensure 'path' is correctly 'nodePath' as used before
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getChordProgressionsPrompt } = require('./prompt-logic');

const app = express();
const port = process.env.PORT || 8080;

let genAI;
let model;
let config = {}; // For musicalKeys and musicTypes

// Function to initialize GoogleGenerativeAI
async function initializeGenerativeAI() {
    let apiKey = process.env.GEMINI_API_KEY;
    const apiKeyFilePath = nodePath.join(__dirname, 'api_config.json');

    if (!apiKey) {
        try {
            const apiKeyFileContent = await fs.readFile(apiKeyFilePath, 'utf-8');
            const apiKeyConfig = JSON.parse(apiKeyFileContent);
            if (apiKeyConfig && apiKeyConfig.geminiApiKey) {
                apiKey = apiKeyConfig.geminiApiKey;
                console.log('Gemini API key loaded from api_config.json.');
            }
        } catch (error) {
            // Non-critical error if file doesn't exist or is unreadable, will fall back.
            // console.warn(`Note: Could not read API key from ${apiKeyFilePath}. ${error.message}`);
        }
    } else {
        console.log('Gemini API key loaded from GEMINI_API_KEY environment variable.');
    }

    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_GOES_HERE' || apiKey === 'YOUR_GEMINI_API_KEY') {
        apiKey = 'YOUR_GEMINI_API_KEY_PLACEHOLDER'; // Use a distinct placeholder
        console.warn('\n*** WARNING: Gemini API key is not configured or using a placeholder. ***');
        console.warn(`*** Please set GEMINI_API_KEY environment variable or create ${apiKeyFilePath} with your key. ***`);
        console.warn('*** The application will run with limited functionality (Gemini calls will fail). ***\n');
    }

    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: "gemini-pro" });
}


// Middleware to enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Endpoint to serve config.json (musical keys and types)
app.get('/api/config', (req, res) => {
  res.json(config);
});

// Endpoint to get chord progressions
app.get('/api/chord-progressions', async (req, res) => {
  const { key, musicType } = req.query;

  if (!model) { // Check if model is initialized
    return res.status(503).json({ error: 'Gemini API client not initialized. Check server logs for API key issues.' });
  }

  if (!key || !musicType) {
    return res.status(400).json({ error: 'Missing key or musicType query parameters.' });
  }

  if (!config.musicalKeys || !config.musicTypes) {
    return res.status(500).json({ error: 'Server musical key/type configuration not loaded.' });
  }

  if (!config.musicalKeys.includes(key) || !config.musicTypes.includes(musicType)) {
    return res.status(400).json({ error: 'Invalid key or musicType.' });
  }

  try {
    const prompt = getChordProgressionsPrompt(key, musicType);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        data = { progressions_text: text };
    }

    res.json(data);

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    // Check if the error message indicates an API key issue specifically
    if (error.message && (error.message.includes('API key not valid') || error.message.includes('API key is invalid'))) {
        res.status(401).json({ error: 'Gemini API key not valid. Please check server configuration (environment variable or api_config.json).' });
    } else {
        res.status(500).json({ error: 'Failed to get chord progressions from Gemini API.' });
    }
  }
});

// Load config and start server
async function startServer() {
  try {
    // Initialize Generative AI (which includes API key loading)
    await initializeGenerativeAI();

    // Load musical keys and types configuration
    const rawConfig = await fs.readFile(nodePath.join(__dirname, 'config.json'), 'utf-8');
    config = JSON.parse(rawConfig);

    app.listen(port, () => {
      console.log(`Backend server listening on port ${port}`);
      console.log('Available endpoints:');
      console.log(`  GET /api/config`);
      console.log(`  GET /api/chord-progressions?key=<key>&musicType=<musicType>`);
    });
  } catch (err) {
    console.error('Failed to load configurations or start server:', err);
    // If error is from API key loading in initializeGenerativeAI, it might have already logged.
    // If it's from config.json, that's critical.
    if (err.message.includes('config.json')) {
        process.exit(1); // Exit if main config can't be loaded
    }
    // If API key loading failed in a critical way not handled by initializeGenerativeAI itself
    // (e.g. a syntax error in api_config.json if it exists), it might also cause an exit here.
    // However, initializeGenerativeAI tries to handle missing/malformed api_config.json gracefully.
  }
}

startServer();
