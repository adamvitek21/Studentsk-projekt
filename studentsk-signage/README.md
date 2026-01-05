# Studentské Signage

This project is a signage application that displays real-time departure information and fallback data. It consists of a FastAPI backend and a JavaScript frontend.

## Project Structure

```
studentsk-signage
├── backend
│   ├── main.py                # Main entry point for the FastAPI application
│   ├── entrypoint.py          # Entrypoint script to wait for GTFS resource
│   ├── requirements.txt        # Python dependencies for the backend
│   ├── Dockerfile              # Docker configuration for the backend
│   ├── .dockerignore           # Files to ignore when building the Docker image
│   ├── scripts
│   │   ├── mock_feed.py        # Script to generate mock GTFS real-time feed
│   │   ├── integration_test.py  # Integration tests for the backend service
│   │   └── test_gtfs.py        # Tests for GTFS real-time feed parsing
│   └── data
│       └── stations.json       # Fallback data for station departures
├── studentsk-signage-frontend
│   ├── src
│   │   ├── index.html          # Main HTML file for the frontend application
│   │   ├── js
│   │   │   └── app.js          # JavaScript logic for fetching and displaying data
│   │   └── css
│   │       └── styles.css      # CSS styles for the frontend application
│   ├── package.json            # npm configuration for the frontend
│   ├── package-lock.json       # Locked versions of frontend dependencies
│   └── .gitignore              # Files to ignore in the frontend project
├── docker-compose.yml          # Configuration for running the application with Docker
├── .gitignore                  # Files to ignore in the root project
└── README.md                   # Documentation for the project
```

## Setup Instructions

### Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment (optional but recommended):
   ```
   python -m venv .venv
   source .venv/bin/activate
   ```

3. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run the backend application:
   ```
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

### Frontend

1. Navigate to the frontend directory:
   ```
   cd studentsk-signage-frontend
   ```

2. Install the frontend dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## Usage

- Access the frontend application in your browser at `http://localhost:5000`.
- The backend API can be accessed at `http://localhost:8000/api`.

## Notes

- To connect to a different backend, add the query parameter `?backend=HOST:PORT` to the frontend URL.
- Ensure that the backend is running before starting the frontend application.