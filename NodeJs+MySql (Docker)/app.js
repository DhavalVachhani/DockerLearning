const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1', 
  user: process.env.DB_USER || 'myuser',
  password: process.env.DB_PASSWORD || 'mypass',
  database: process.env.DB_NAME || 'mydb',
  port: process.env.DB_PORT || 3307
});


db.connect(err => {
  if (err) { console.error('DB connection failed:', err); process.exit(1); }
  console.log('Connected to MySQL');
});

// Create table
db.query(`
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100)
  )
`);

// CRUD Endpoints
app.get('/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.get('/users/:id', (req, res) => {
  db.query('SELECT *,name as name2 FROM users WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results[0]);
  });
});

app.post('/users', (req, res) => {
  const { name, email } = req.body;
  db.query('INSERT INTO users (name, email) VALUES (?, ?)', [name, email], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ id: result.insertId, name, email });
  });
});

app.put('/users/:id', (req, res) => {
  const { name, email } = req.body;
  db.query('UPDATE users SET name=?, email=? WHERE id=?', [name, email, req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ id: req.params.id, name, email });
  });
});

app.delete('/users/:id', (req, res) => {
  db.query('DELETE FROM users WHERE id=?', [req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'User deleted' });
  });
});

app.listen(3000, () => console.log('Server running on port 3000'));
