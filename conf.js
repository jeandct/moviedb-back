const mysql = require('mysql');
require('dotenv').config();

const db_config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

let connection;

const handleConnection = () => {
  connection = mysql.createConnection(db_config);

  // Prevend from db disconnection

  connection.connect((err) => {
    if (err) {
      console.error(err);
      setTimeout(handleConnection, 2000);
    }
    console.log('connected as id ' + connection.threadId);
  });

  connection.on('error', function (err) {
    console.log('db error', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleConnection();
    } else {
      throw err;
    }
  });
};

handleConnection();

module.exports = connection;
