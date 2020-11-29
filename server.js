require('dotenv').config();
const express = require('express');
const PORT = process.env.PORT || 8080;
const connection = require('./conf');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const app = express();

// Middlewares

app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);
app.use(cookieParser());

// -- End Middlewares --

// Routes

app.get('/user/:username', (req, res) => {
  const { username } = req.params;
  const token = req.cookies.token;

  if (!token) {
    res.status(401).send('Access unauthorized : No token provided');
  } else {
    let decoded = jwt.verify(token, 'secretKey');
    console.log(decoded);
    if (username === decoded.payload) {
      connection.query(
        'SELECT * FROM users WHERE username = ? ',
        [username],
        (err, user) => {
          if (err) {
            res.status(500).send('Error collecting user info');
          } else {
            res.json(user[0]);
          }
        }
      );
    }
  }
});

app.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  connection.query(
    'SELECT * FROM users WHERE username = ?',
    [username],
    async (err, results) => {
      if (results.length > 0) {
        res.status(409).send('User already registered');
      } else {
        let hashedPassword = await bcrypt.hash(password, 10);
        connection.query(
          'INSERT INTO users(username, email, password) VALUES(?, ?, ?)',
          [username, email, hashedPassword],
          (err, results) => {
            if (err) {
              console.log(err);
              res.status(500).send('Error in registering user');
            } else {
              res.send('User successfully registered');
            }
          }
        );
      }
    }
  );
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  connection.query(
    'SELECT * from users WHERE email = ?',
    [email],
    async (err, user) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error');
      } else if (
        user.length <= 0 ||
        !(await bcrypt.compare(password, user[0].password))
      ) {
        res.status(401).send('username or password is incorrect');
      } else {
        const payload = user[0].username;
        const token = jwt.sign({ payload }, 'secretKey', { expiresIn: '90d' });
        const cookieOptions = {
          expiresIn: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), //in ms
          httpOnly: true,
        };

        res.cookie('token', token, cookieOptions);
        res.status(200).json(user[0]);
      }
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server listening in port ${PORT}`);
});
