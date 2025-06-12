# Gemini Chord Progression Finder

This project is a web application that helps users discover chord progressions and songs based on a selected musical key and music type. It uses Node.js for both the frontend and backend, and leverages the Gemini API to generate the musical information.

## Features

*   Selectable musical keys and music types.
*   Dynamic fetching of chord progressions and associated songs from the Gemini API.
*   Separately deployable frontend and backend applications, containerized with Docker.
*   Configuration-driven musical key and music type options.
*   Flexible Gemini API key configuration (environment variable or local JSON file).

## Prerequisites

*   [Node.js](https://nodejs.org/) (version 18.x or later recommended)
*   npm (comes with Node.js)
*   A valid Gemini API Key (see [Google AI Studio](https://aistudio.google.com/app/apikey))

## Project Structure

```
.
├── backend/        # Node.js Express backend
│   ├── public/
│   ├── node_modules/
│   ├── config.json         # Configuration for musical keys and types
│   ├── api_config.json.example # Example for Gemini API key
│   ├── Dockerfile
│   ├── index.js            # Main server file
│   ├── prompt-logic.js     # Logic for Gemini prompts
│   └── package.json
├── frontend/       # Node.js Express static server for frontend
│   ├── public/
│   │   └── index.html      # Main HTML file for the UI
│   ├── node_modules/
│   ├── Dockerfile
│   ├── server.js           # Express server for static files
│   └── package.json
└── README.md
```

## Setup and Running Locally

### 1. Backend Setup

a.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

b.  **Install dependencies:**
    ```bash
    npm install
    ```

c.  **Configure your Gemini API Key:**
    You have two options:

    *   **Option 1: Using `api_config.json` (Recommended for local testing)**
        1.  Copy the example configuration file:
            ```bash
            cp api_config.json.example api_config.json
            ```
        2.  Open `api_config.json` in a text editor and replace `"YOUR_GEMINI_API_KEY_GOES_HERE"` with your actual Gemini API key.
            ```json
            {
              "geminiApiKey": "YOUR_ACTUAL_GEMINI_API_KEY"
            }
            ```
            This file is listed in `.gitignore` and will not be committed.

    *   **Option 2: Using an Environment Variable**
        Set the `GEMINI_API_KEY` environment variable to your API key.
        ```bash
        export GEMINI_API_KEY="YOUR_ACTUAL_GEMINI_API_KEY"
        ```
        (For Windows, use `set GEMINI_API_KEY=YOUR_ACTUAL_GEMINI_API_KEY`)

d.  **Start the backend server:**
    ```bash
    npm start
    ```
    (Assuming `scripts: { "start": "node index.js" }` is in `backend/package.json`. If not, use `node index.js`)

    The backend server will typically start on `http://localhost:8080`. Check the console output for the exact URL and API key status.

### 2. Frontend Setup

a.  **Navigate to the frontend directory (from the project root):**
    ```bash
    cd ../frontend
    ```
    (If you are already in the `backend` directory) or `cd frontend` (from project root).

b.  **Install dependencies:**
    ```bash
    npm install
    ```

c.  **Start the frontend server:**
    ```bash
    npm start
    ```
    (Assuming `scripts: { "start": "node server.js" }` is in `frontend/package.json`. If not, use `node server.js`)

    The frontend server will now default to `http://localhost:3000`.

### Port Configuration for Local Development

*   **Backend (`backend/server.js`):** Defaults to port `8080`. You can change this by setting the `PORT` environment variable before running `npm start` (e.g., `PORT=8081 npm start`).
*   **Frontend (`frontend/server.js`):** Defaults to port `3000`. You can change this by setting the `PORT` environment variable (e.g., `PORT=3001 npm start`).

**Important:** The frontend application (`frontend/public/index.html`) is configured to communicate with the backend API at `http://localhost:8080` (this is set in its `backendBaseUrl` JavaScript variable).
*   If you change the backend port from its default `8080`, you **must** update the `backendBaseUrl` variable in `frontend/public/index.html` to match the new backend port, and then restart the frontend server.
*   Changing the frontend port does not require changes in `backendBaseUrl`.

### 3. Accessing the Application

Once both servers are running (on different ports if necessary):

*   Open your web browser and navigate to the frontend URL, which defaults to `http://localhost:3000`.
*   The musical keys and types should load in the dropdowns.
*   Select your desired options and click "Get Chord Progressions".

## Deployment to Cloud Run

Both the `backend` and `frontend` directories contain `Dockerfile`s, allowing them to be built as Docker images and deployed separately to Google Cloud Run or any other container hosting platform.

When deploying:
*   **Backend:** Ensure the `GEMINI_API_KEY` environment variable is set in your Cloud Run service configuration.
*   **Frontend:** You might need to configure the `backendBaseUrl` in `frontend/public/index.html` to point to the deployed URL of your backend service. This can be done by rebuilding the frontend image with the correct URL or by having the frontend server inject this configuration at runtime (an advanced setup not currently implemented).

*   test
