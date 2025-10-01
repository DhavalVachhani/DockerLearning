# Node.js + MySQL (Docker)

This guide explains how to connect a **Node.js application running on the host machine** with a **MySQL database running inside a Docker container**.

---

## 🐬 MySQL Docker Setup

### Step 1: Pull the MySQL Docker Image

```bash
docker pull mysql
```

### Step 2: Run the MySQL Container

```bash
docker run -d 
  --name mydb \
  -e MYSQL_ROOT_PASSWORD=rootpass \
  -e MYSQL_DATABASE=mydb \
  -e MYSQL_USER=myuser \
  -e MYSQL_PASSWORD=mypass \
  -p 3307:3306 \
mysql:latest
```


## 🔍 Breakdown of Each Part

### `docker run -d`
- **`docker run`** → tells Docker to create and start a new container.  
- **`-d`** → runs the container in **detached mode** (in the background).  

---

### `--name mydb`
- Assigns the container a **name** (`mydb`).  
- Without this, Docker gives the container a random name.  
- Useful for referencing the container later, e.g.:  
  ```bash
  docker stop mydb
  docker start mydb
  docker logs mydb
  ```

---

### `-e MYSQL_ROOT_PASSWORD=rootpass`
- Sets the **root user password** for MySQL inside the container.  
- Required for MySQL to initialize.  
- Example login with root:  
  ```bash
  docker exec -it mydb mysql -u root -p
  # then enter rootpass
  ```

---

### `-e MYSQL_DATABASE=mydb`
- Creates a **new database** named `mydb` when the container starts for the first time.  
- Saves you from manually creating it later.

---

### `-e MYSQL_USER=myuser`
- Creates a new **non-root user** called `myuser`.  
- This user is safer to use in applications (instead of root).

---

### `-e MYSQL_PASSWORD=mypass`
- Sets the password for the `myuser` account.  
- Example connection string:  
  ```bash
  mysql -h 127.0.0.1 -P 3307 -u myuser -p
  # then enter mypass
  ```

---

### `-p 3307:3306`
- Maps ports between **host** and **container**:  
  - `3307` → port on your **local machine** (host).  
  - `3306` → default MySQL port inside the **container**.  
- This means you can connect to MySQL using:  
  ```
  Host: 127.0.0.1
  Port: 3307
  ```

---

### `mysql:latest`
- Specifies which Docker image to use.  
- **`mysql`** → official MySQL image.  
- **`:latest`** → latest available version (but for stability, use a fixed version like `mysql:8.0`).

---

## ✅ Summary

This command:
1. Runs a MySQL container in the background.  
2. Names it `mydb`.  
3. Sets up a root password (`rootpass`).  
4. Creates a database (`mydb`).  
5. Creates a user (`myuser`) with password (`mypass`).  
6. Maps host port `3307` to container port `3306`.  
7. Uses the latest MySQL image.  

You can now connect from **Node.js** or any MySQL client at:  

```
Host: 127.0.0.1
Port: 3307
User: myuser
Password: mypass
Database: mydb
```


- **`--name mydb`** → container name  
- **`MYSQL_ROOT_PASSWORD`** → root user password  
- **`MYSQL_DATABASE`** → default database created at startup  
- **`MYSQL_USER` / `MYSQL_PASSWORD`** → non-root user credentials  
- **`-p 3307:3306`** → maps local port **3307** to container's MySQL port **3306**  

Note : 
```
MYSQL_ROOT_PASSWORD is required because:

- MySQL needs a root account (superuser) when the database is first initialized.

- Without setting this, MySQL inside the container wouldn’t know what password to assign to root, making it insecure or unusable.

- Docker’s official MySQL image will not start unless MYSQL_ROOT_PASSWORD (or an alternative like MYSQL_ALLOW_EMPTY_PASSWORD or MYSQL_RANDOM_ROOT_PASSWORD) is provided.

In short: it ensures the root user has a defined password for secure initial access.
```

---
---

## 🚀 Node.js Setup

### Install Dependencies

```bash
npm init -y
npm install express mysql2 body-parser
```

### Create `server.js`

```js
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1', // Use 127.0.0.1, not http://localhost
  user: process.env.DB_USER || 'myuser',
  password: process.env.DB_PASSWORD || 'mypass',
  database: process.env.DB_NAME || 'mydb',
  port: process.env.DB_PORT || 3307
});

db.connect(err => {
  if (err) { 
    console.error('DB connection failed:', err); 
    process.exit(1); 
  }
  console.log('✅ Connected to MySQL');
});

// Create table if not exists
db.query(`
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100)
  )
`);

// CRUD Endpoints

// Get all users
app.get('/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Get user by ID
app.get('/users/:id', (req, res) => {
  db.query('SELECT * FROM users WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results[0]);
  });
});

// Create user
app.post('/users', (req, res) => {
  const { name, email } = req.body;
  db.query('INSERT INTO users (name, email) VALUES (?, ?)', [name, email], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ id: result.insertId, name, email });
  });
});

// Update user
app.put('/users/:id', (req, res) => {
  const { name, email } = req.body;
  db.query('UPDATE users SET name=?, email=? WHERE id=?', [name, email, req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ id: req.params.id, name, email });
  });
});

// Delete user
app.delete('/users/:id', (req, res) => {
  db.query('DELETE FROM users WHERE id=?', [req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'User deleted' });
  });
});

// Start server
app.listen(3000, () => console.log('🚀 Server running on port 3000'));
```

---

## 🧪 Testing the API

### Run the server

```bash
node server.js
```

### Example Requests

- **Get all users**  
  `GET http://localhost:3000/users`  

- **Get a user by ID**  
  `GET http://localhost:3000/users/1`  

- **Create a new user**  
  `POST http://localhost:3000/users`  
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com"
  }
  ```

- **Update a user**  
  `PUT http://localhost:3000/users/1`  
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
  ```

- **Delete a user**  
  `DELETE http://localhost:3000/users/1`  

---

## ✅ Summary

- MySQL runs inside Docker on **port 3307**.  
- Node.js connects to it using `127.0.0.1:3307`.  
- Simple Express API performs CRUD operations on the `users` table.  
