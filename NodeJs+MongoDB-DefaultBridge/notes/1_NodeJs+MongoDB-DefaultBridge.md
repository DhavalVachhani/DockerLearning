# Node.js + MongoDB CRUD App (Separate Containers on Default Network)

This guide explains how to run a **Node.js CRUD app** and **MongoDB** in **separate Docker containers** using Docker's **default bridge network**, without specifying a custom network or using Docker Compose.

- [Node.js + MongoDB CRUD App (Separate Containers on Default Network)](#nodejs--mongodb-crud-app-separate-containers-on-default-network)
  - [1️⃣ Prerequisites](#1️⃣-prerequisites)
  - [2️⃣ Start MongoDB Container](#2️⃣-start-mongodb-container)
  - [3️⃣ Create Node.js Project](#3️⃣-create-nodejs-project)
  - [4️⃣ Create `app.js`](#4️⃣-create-appjs)
  - [5️⃣ Create Dockerfile](#5️⃣-create-dockerfile)
  - [6️⃣ Build Node.js Docker Image](#6️⃣-build-nodejs-docker-image)
  - [7️⃣ Start Node.js Container](#7️⃣-start-nodejs-container)
  - [8️⃣ API Endpoints Summary](#8️⃣-api-endpoints-summary)
  - [9️⃣ Test the API](#9️⃣-test-the-api)
  - [🔟 Verify Containers](#-verify-containers)
  - [1️⃣1️⃣ Stop and Remove Containers](#1️⃣1️⃣-stop-and-remove-containers)

---

---


## 1️⃣ Prerequisites

* Install [Docker](https://www.docker.com/)

---

## 2️⃣ Start MongoDB Container

Run MongoDB container on the **default Docker network**:

```bash
docker run -d \
  --name mongo \
  -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD=pass \
  -p 27017:27017 \
  mongo:latest
```

* `-d` → run in background
* `--name mongo` → container name
* `-p 27017:27017` → maps MongoDB to host port for testing
* `MONGO_INITDB_ROOT_USERNAME` & `MONGO_INITDB_ROOT_PASSWORD` → set root user

> **Note:** No network is specified, so it uses Docker’s default bridge network.

---

## 3️⃣ Create Node.js Project

```bash
mkdir mynodeapp && cd mynodeapp
npm init -y
npm install express mongoose
```


## 4️⃣ Create `app.js`

```js
const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// MongoDB connection string using mongodb container ip
const mongoURI = "mongodb://root:pass@172.17.0.2:27017/mydb?authSource=admin";

// Connect to MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// Schema + Model
const UserSchema = new mongoose.Schema({ name: String, email: String });
const User = mongoose.model("User", UserSchema);

// CRUD Routes
app.post("/users", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: "Invalid user ID" });
  }
});

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

app.delete("/users/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: "Invalid user ID" });
  }
});

app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));
```

> **Note:** `host.docker.internal` allows the Node.js container to reach the host machine, where MongoDB’s port `27017` is mapped.

---

## 5️⃣ Create Dockerfile

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "app.js"]
```

---

## 6️⃣ Build Node.js Docker Image

```bash
docker build -t mynodeappimage:1.0 .
```

---

## 7️⃣ Start Node.js Container

```bash
docker run -d \
  --name nodeapp \
  -p 3000:3000 \
  mynodeappimage:1.0
```

> No network is specified; container uses Docker’s default bridge network. Node.js connects to MongoDB using `host.docker.internal:27017`.

---

## 8️⃣ API Endpoints Summary

| Method | Endpoint     | Description           |
| ------ | ------------ | --------------------- |
| POST   | `/users`     | Create new user       |
| GET    | `/users`     | Get all users         |
| GET    | `/users/:id` | Get single user by ID |
| PUT    | `/users/:id` | Update user by ID     |
| DELETE | `/users/:id` | Delete user by ID     |

---

## 9️⃣ Test the API

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

## 🔟 Verify Containers

```bash
docker ps
```

> You should see both `nodeapp` and `mongo` running on the default network.

---

## 1️⃣1️⃣ Stop and Remove Containers

```bash
docker stop nodeapp mongo
docker rm nodeapp mongo
```

---

✅ Done! You now have:

* Node.js running in a container
* MongoDB running in a separate container
* Both using Docker’s **default bridge network**
* Full CRUD API working