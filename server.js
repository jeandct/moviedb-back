require('dotenv').config();
const express = require('express');
const PORT = process.env.PORT || 8080;
const connection = require('./conf');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

// Middlewares

app.use(express.json());
app.use(
  cors({
    credentials: true,
  })
);
app.use(cookieParser());

// -- End Middlewares --

// Routes

app.listen(PORT, () => {
  console.log(`Server listening in port ${PORT}`);
});
