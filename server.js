const express = require('express');
const helmet = require('helmet');
const cors = require('cors'); // Import CORS only once
const bcrypt = require('bcryptjs');
const pool = require('./db'); // Import the database connection
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
    origin: 'http://localhost:3000', // Adjust this if your frontend is on a different port or domain
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());
app.use(express.json());

// Test Database Route
app.get('/test-db', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT NOW()');
    res.send(`Database time: ${rows[0].now}`);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error connecting to the database");
  }
});

// Basic Welcome Route
app.get('/', (req, res) => {
  res.send('Welcome to Blackjack Blitz Backend!');
});

// Registration Route
app.post('/register', async (req, res) => {
  const { email, password, wallet_address = null } = req.body; // Allow wallet_address to be optional
  if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
      // Check if user already exists
      const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
          return res.status(409).json({ message: 'User already exists.' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert new user
      const newUser = await pool.query(
          'INSERT INTO users (email, password, wallet_address) VALUES ($1, $2, $3) RETURNING *',
          [email, hashedPassword, wallet_address]
      );
      res.status(201).json(newUser.rows[0]);
  } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
  }
});


// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        // Check if user exists
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Validate password
        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        res.json({ message: 'Login successful', user: user.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
