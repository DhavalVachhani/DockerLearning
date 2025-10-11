# MongoDB + Mongo Express in Docker

This guide explains how to run MongoDB container (no Docker Compose used), with a Mongo Express web interface linked to MongoDB.

---

## 1️⃣ Start MongoDB in Docker

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

## 2️⃣ Start Mongo Express Container

Link Mongo Express to MongoDB container:

```bash
docker run -d \
  --name my-mongo-express \
  -p 8081:8081 \
  -e ME_CONFIG_MONGODB_ADMINUSERNAME=root \
  -e ME_CONFIG_MONGODB_ADMINPASSWORD=pass \
  -e ME_CONFIG_MONGODB_SERVER=my-mongo \
  --link my-mongo:mongo \
  mongo-express:1.0.0
```

* `-p 8081:8081` → web UI accessible at `http://localhost:8081`
* `--link my-mongo:mongo` → links to MongoDB container

---

## 3️⃣ Verify MongoDB and Mongo Express

```bash
docker ps
```

* Access Mongo Express: `http://localhost:8081`
* Use `root` / `example` to log in

Test MongoDB connection with:

```bash
docker exec -it my-mongo mongosh -u root -p example
```


## 4️⃣ Stop MongoDB and Mongo Express Containers

```bash
docker stop my-mongo my-mongo-express
docker rm my-mongo my-mongo-express
```

---

✅ Done! You now have:

* MongoDB running inside Docker
* Mongo Express UI linked to MongoDB
