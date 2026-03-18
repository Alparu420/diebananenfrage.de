# 🍌 Banana Voting Website

A fun interactive website where users vote on their favorite banana images!

## Features

- 🎨 Beautiful, responsive voting interface with 6 banana images
- 📊 Real-time results page with interactive bar graph
- 💾 Vote data saved to lightweight SQLite database
- 🔄 Auto-refreshing results dashboard
- ⚡ Fast and lightweight

## Setup Instructions

### 1. Install Node.js dependencies
```bash
npm install
```

### 2. Start the server
```bash
npm start
```

The website will be available at: **http://localhost:3000**

## How It Works

### Voting Page (`/`)
- Users see 6 banana images (banane-1 through banane-6)
- Clicking on a banana image registers their vote
- After voting, they're automatically redirected to the results page

### Results Page (`/results.html`)
- Displays a bar graph showing vote counts for each banana
- Shows total number of votes cast
- Shows which banana is the most popular
- Vote breakdown with percentages
- Auto-refreshes every 5 seconds
- Provides buttons to vote again or refresh results

### Vote Storage
Votes are stored in a lightweight SQLite database (`banana_votes.db`) with a simple schema:
```
Table: votes
- banana_id (INTEGER PRIMARY KEY, 1-6)
- vote_count (INTEGER)
```

## Technology Stack

- **Backend**: Express.js (Node.js)
- **Frontend**: HTML5, CSS3, JavaScript
- **Charts**: Chart.js
- **Database**: SQLite (sql.js - pure JavaScript, no native dependencies)

## API Endpoints

### POST /api/vote
Submit a vote for a banana
- Request body: `{ "banana_id": 1-6 }`
- Response: `{ "success": true }`

### GET /api/votes
Get current vote counts
- Response: `{ "votes": [5, 3, 7, 2, 4, 6], "total": 27 }`

## Files

- `server.js` - Express server and API endpoints
- `index.html` - Voting page
- `results.html` - Results page with bar chart
- `package.json` - Node.js project configuration
- `banana_votes.db` - SQLite database storing vote counts (auto-created)
- `banane-1.png` through `banane-6.png` - Banana images

Enjoy voting! 🎉
