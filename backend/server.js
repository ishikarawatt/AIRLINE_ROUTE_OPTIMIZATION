const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');

app.get('/airports', (req, res) => {
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, 'airports.json'), 'utf8');
    res.setHeader('Content-Type', 'application/json');
    res.send(raw);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not read airports data ' });
  }
});

   app.get('/edges', (req, res) => {
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, 'edges.json'), 'utf8');
    res.setHeader('Content-Type', 'application/json');
    res.send(raw);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not read edges data' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running at http://127.0.0.1:${PORT}`);
});
