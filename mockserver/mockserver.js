// mock-scrum-poker-server.js
// A simple in-memory mock server using Express to test the Scrum Poker OpenAPI spec

const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3000;
app.use(bodyParser.json());

// In-memory storage
const rooms = new Map();

// Create a new room
app.post('/rooms', (req, res) => {
  const id = uuidv4();
  const name = req.body.name || `Room-${id.slice(0, 5)}`;
  const room = {
    id,
    name,
    revealed: false,
    players: [req.body.player],
  };
  rooms.set(id, room);
  res.status(201).json(room);
});

// Get room info
app.get('/rooms/:roomId', (req, res) => {
  const room = rooms.get(req.params.roomId);
  if (!room) return res.status(404).send('Room not found');
  res.json(room);
});

// Submit or update an estimate
app.put('/rooms/:roomId/estimates', (req, res) => {
  const { playerId, estimate } = req.body;
  const room = rooms.get(req.params.roomId);
  if (!room) return res.status(404).send('Room not found');
  if (typeof playerId !== 'string' || typeof estimate !== 'number') {
    return res.status(400).send('Invalid input');
  }

  const existing = room.players.find(p => p.id === playerId);
  if (existing) {
    existing.estimate = estimate;
  } else {
    room.players.push({ id: playerId , estimate });
  }
  res.status(200).send();
});

// Patch: reveal or reset
app.patch('/rooms/:roomId', (req, res) => {
  const { action } = req.body;
  const room = rooms.get(req.params.roomId);
  if (!room) return res.status(404).send('Room not found');
  if (action === 'reveal') {
    room.revealed = true;
  } else if (action === 'reset') {
    room.revealed = false;
    room.players.forEach(p => (p.estimate = null));
  } else {
    return res.status(400).send('Invalid action');
  }
  res.status(200).json(room);
});

// Join a room (register player)
app.post('/rooms/:roomId/players', (req, res) => {
  const { playerName, playerId } = req.body;
  const room = rooms.get(req.params.roomId);
  if (!room) return res.status(404).send('Room not found');
  if (typeof playerName !== 'string' || !playerName.trim()) {
    return res.status(400).send('Invalid input');
  }
  const exists = room.players.some(p => p.name === playerName);
  if (!exists) {
    room.players.push({ name: playerName, id: playerId, estimate: null });
  }
  res.status(200).send('Player joined');
});

// Start the server
app.listen(port, () => {
  console.log(`Mock Scrum Poker server running at http://localhost:${port}`);
});
