const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

db.initializeFiles();
console.log('JSON database initialized');

const authRoutes = require('./routes/auth');
const olympiadRoutes = require('./routes/olympiad');
const userRoutes = require('./routes/user');

app.use('/api/auth', authRoutes);
app.use('/api/olympiad', olympiadRoutes);
app.use('/api/user', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
