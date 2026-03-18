from flask import Flask, request, jsonify, send_from_directory
import sqlite3
import os
from pathlib import Path

app = Flask(__name__, static_folder='.', static_url_path='')

DB_PATH = 'banana_votes.db'

def init_db():
    """Initialize the SQLite database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create table if it doesn't exist
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS votes (
            banana_id INTEGER PRIMARY KEY CHECK (banana_id >= 1 AND banana_id <= 6),
            vote_count INTEGER NOT NULL DEFAULT 0
        )
    ''')
    
    # Check if we have initial records
    cursor.execute('SELECT COUNT(*) FROM votes')
    count = cursor.fetchone()[0]
    
    if count == 0:
        # Insert initial records
        for i in range(1, 7):
            cursor.execute('INSERT INTO votes (banana_id, vote_count) VALUES (?, ?)', (i, 0))
    
    conn.commit()
    conn.close()

def get_vote_counts():
    """Get current vote counts for all bananas"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT banana_id, vote_count FROM votes ORDER BY banana_id')
    rows = cursor.fetchall()
    conn.close()
    
    votes = [0] * 6
    for banana_id, vote_count in rows:
        votes[banana_id - 1] = vote_count
    
    return votes

@app.route('/')
def index():
    """Serve the voting page"""
    return send_from_directory('.', 'index.html')

@app.route('/results.html')
def results():
    """Serve the results page"""
    return send_from_directory('.', 'results.html')

@app.route('/<path:filename>')
def serve_static(filename):
    """Serve static files (images, etc)"""
    return send_from_directory('.', filename)

@app.route('/api/vote', methods=['POST'])
def vote():
    """Handle vote submission"""
    try:
        data = request.get_json()
        banana_id = data.get('banana_id')
        
        # Validate input
        if not banana_id or banana_id < 1 or banana_id > 6:
            return jsonify({'error': 'Invalid banana ID'}), 400
        
        # Update vote count
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('UPDATE votes SET vote_count = vote_count + 1 WHERE banana_id = ?', (banana_id,))
        conn.commit()
        conn.close()
        
        return jsonify({'success': True})
    
    except Exception as e:
        print(f'Error saving vote: {e}')
        return jsonify({'error': 'Failed to save vote'}), 500

@app.route('/api/votes', methods=['GET'])
def get_votes():
    """Get current vote counts"""
    try:
        votes = get_vote_counts()
        total = sum(votes)
        return jsonify({'votes': votes, 'total': total})
    
    except Exception as e:
        print(f'Error getting votes: {e}')
        return jsonify({'error': 'Failed to get votes'}), 500

if __name__ == '__main__':
    init_db()
    app.run(debug=False, host='0.0.0.0', port=3000)
