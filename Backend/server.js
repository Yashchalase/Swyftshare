require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const path = require('path');
const cors = require('cors');
 
app.use(express.static('public'));

const connectDB = require('./config/db');
connectDB();

//Cors  Middleware
const corsOption = {
    origin: process.env.ALLOWED_CLIENTS.split(',')
}

app.use(cors(corsOption));

app.use(express.json());

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

app.get('/api/ping', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes 
app.use('/api/files', require('./Routes/files'));
app.use('/files', require('./Routes/show'));
app.use('/files/download', require('./Routes/download'));


app.listen(PORT, console.log(`Listening on port ${PORT}.`));
