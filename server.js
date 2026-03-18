const express = require('express');
const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'banana_votes.db');

let db = null;

// Middleware
app.use(express.static(__dirname));
app.use(express.json());

// Initialize database
async function initializeDatabase() {
  try {
    const SQL = await initSqlJs();
    
    // Try to load existing database
    if (fs.existsSync(DB_PATH)) {
      const buffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(buffer);
    } else {
      // Create new database
      db = new SQL.Database();
    }

    // Create table if it doesn't exist
    db.run(`
      CREATE TABLE IF NOT EXISTS votes (
        banana_id INTEGER PRIMARY KEY CHECK (banana_id >= 1 AND banana_id <= 6),
        vote_count INTEGER NOT NULL DEFAULT 0
      )
    `);

    // Insert initial records if they don't exist
    const result = db.exec('SELECT COUNT(*) as count FROM votes');
    const count = result.length > 0 ? result[0].values[0][0] : 0;
    
    if (count === 0) {
      for (let i = 1; i <= 6; i++) {
        db.run('INSERT INTO votes (banana_id, vote_count) VALUES (?, ?)', [i, 0]);
      }
    }

    saveDatabase();
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
}

// Save database to file
function saveDatabase() {
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

// Get current vote counts
function getVoteCounts() {
  try {
    const result = db.exec('SELECT banana_id, vote_count FROM votes ORDER BY banana_id');
    const votes = [0, 0, 0, 0, 0, 0];
    
    if (result.length > 0) {
      result[0].values.forEach(row => {
        votes[row[0] - 1] = row[1];
      });
    }
    return votes;
  } catch (err) {
    console.error('Error getting votes:', err);
    return [0, 0, 0, 0, 0, 0];
  }
}

// Handle vote submission
app.post('/api/vote', (req, res) => {
  const { banana_id } = req.body;

  if (!banana_id || banana_id < 1 || banana_id > 6) {
    return res.status(400).json({ error: 'Invalid banana ID' });
  }

  try {
    db.run('UPDATE votes SET vote_count = vote_count + 1 WHERE banana_id = ?', [banana_id]);
    saveDatabase();
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving vote:', err);
    res.status(500).json({ error: 'Failed to save vote' });
  }
});

// Get current vote counts
app.get('/api/votes', (req, res) => {
  try {
    const votes = getVoteCounts();
    const total = votes.reduce((a, b) => a + b, 0);
    res.json({ votes, total });
  } catch (err) {
    console.error('Error getting votes:', err);
    res.status(500).json({ error: 'Failed to get votes' });
  }
});

// Initialize and start server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Banana voting website running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize:', err);
  process.exit(1);
});
