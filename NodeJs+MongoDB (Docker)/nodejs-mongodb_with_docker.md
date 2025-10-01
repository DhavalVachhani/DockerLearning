# Node.js + MongoDB CRUD App (MongoDB in Docker)

This guide explains how to run a Node.js app locally while connecting to a MongoDB container.

---

## 1️⃣ Prerequisites

* Install [Node.js](https://nodejs.org/) (>= 18 recommended)
* Install [Docker](https://www.docker.com/)
* Install MongoDB driver for Node.js (`mongodb` or `mongoose`)

---

## 2️⃣ Start MongoDB in Docker

Run MongoDB container:

```bash
docker run -d \
  --name my-mongo \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD=pass \
  mongo:latest
```

* `-d` → run in background
* `--name my-mongo` → container name
* `-p 27017:27017` → map Mongo port
* `MONGO_INITDB_ROOT_USERNAME` & `MONGO_INITDB_ROOT_PASSWORD` → set root user

---

## 3️⃣ Verify MongoDB is Running

```bash
docker ps
```

Test connection with:

```bash
docker exec -it my-mongo mongosh -u root -p pass
```

---

## 4️⃣ Create Node.js Project

```bash
mkdir node-mongo-app && cd node-mongo-app
npm init -y
npm install express mongoose
```

---

## 5️⃣ Create `server.js`

```js
const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// MongoDB connection string (using container’s exposed port 27017)
const mongoURI = "mongodb://root:pass@localhost:27017/mydb?authSource=admin";

// Connect to MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// Schema + Model
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
});
const User = mongoose.model("User", UserSchema);

//
// CRUD ROUTES
//

// CREATE - Add new user
app.post("/users", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ ALL - Get all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE - Get user by ID
app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: "Invalid user ID" });
  }
});

// UPDATE - Update user by ID
app.put("/users/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE - Remove user by ID
app.delete("/users/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: "Invalid user ID" });
  }
});

// Start server
app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));
```

---

## 6️⃣ API Endpoints Summary

| Method | Endpoint     | Description           |
| ------ | ------------ | --------------------- |
| POST   | `/users`     | Create new user       |
| GET    | `/users`     | Get all users         |
| GET    | `/users/:id` | Get single user by ID |
| PUT    | `/users/:id` | Update user by ID     |
| DELETE | `/users/:id` | Delete user by ID     |

---

## 7️⃣ Test the API

* **Create user**

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com"}'
```

* **Get all users**

```bash
curl http://localhost:3000/users
```

* **Get user by ID**

```bash
curl http://localhost:3000/users/<id>
```

* **Update user**

```bash
curl -X PUT http://localhost:3000/users/<id> \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice Updated","email":"alice.new@example.com"}'
```

* **Delete user**

```bash
curl -X DELETE http://localhost:3000/users/<id>
```

---

## 8️⃣ Stop MongoDB Container

```bash
docker stop my-mongo
docker rm my-mongo
```

---

✅ Done! You now have:

* Node.js running locally
* MongoDB running inside Docker
* Full CRUD API
