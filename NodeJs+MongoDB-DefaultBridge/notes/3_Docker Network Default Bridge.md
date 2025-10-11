
---

## 🧩 1. What Is the Docker Default Bridge Network?

When you install Docker, it **automatically creates a network named `bridge`**.
This is the **default network** that containers use when you don’t specify any other network.

You can check it by running:

```bash
docker network ls
```

You’ll see something like:

```
NETWORK ID     NAME      DRIVER    SCOPE
f2e4a2c3c9a7   bridge    bridge    local
9d22b33b3b6f   host      host      local
adf8b2ccbb7a   none      null      local
```

So the **`bridge`** network is created automatically by Docker.

---

## ⚙️ 2. How Does the Default Bridge Network Work?

When you run a container without specifying a network, like this:

```bash
docker run -d nginx
```

Docker automatically connects the container to the **default `bridge` network**.

Each container gets:

* Its **own private IP address** (e.g., 172.17.0.2)
* A **virtual Ethernet interface** that connects it to Docker’s bridge (`docker0`)
* Network address translation (NAT) for external internet access

So, the flow looks like this:

```
[Container] <---> [docker0 bridge] <---> [Host Network Interface] <---> [Internet]
```

---

## 🌐 3. Default Bridge Network Limitations

The **default bridge** has some limitations:

| Feature                             | Supported in Default Bridge? | Notes                                                    |
| ----------------------------------- | ---------------------------- | -------------------------------------------------------- |
| Container name-based DNS resolution | ❌ No                         | Containers **cannot** communicate using names, only IPs. |
| Container isolation                 | ⚠️ Partial                   | Containers share the same bridge.                        |
| Easier service discovery            | ❌ No                         | You have to manually link containers.                    |
| Custom subnets / IP ranges          | ❌ No                         | Uses the default subnet (172.17.0.0/16).                 |

So if you have two containers:

```bash
docker run -d --name container1 nginx
docker run -d --name container2 busybox sleep 3600
```

You **cannot ping by name**:

```bash
docker exec -it container2 ping container1
# ping: bad address 'container1'
```

You’d have to use the IP address instead.

---

## 🚀 4. Custom Bridge Networks (Better Alternative)

You can create your **own bridge network** that fixes these issues:

```bash
docker network create mynetwork
```

Now run containers in that network:

```bash
docker run -d --name container1 --network mynetwork nginx
docker run -it --name container2 --network mynetwork busybox
```

Now you can do:

```bash
ping container1
```

✅ It works — because **custom bridge networks have built-in DNS** support.

---

## 🧠 5. Inspecting the Default Bridge

You can see details about the default bridge with:

```bash
docker network inspect bridge
```

You’ll see info like:

```json
{
    "Name": "bridge",
    "Driver": "bridge",
    "IPAM": {
        "Config": [
            {
                "Subnet": "172.17.0.0/16",
                "Gateway": "172.17.0.1"
            }
        ]
    }
}
```

---

## 🛠️ 6. When to Use Default Bridge

Use the **default bridge** when:

* You just want to run a single, standalone container.
* You don’t need containers to talk to each other by name.
* You’re doing simple local testing.

Otherwise, for multi-container apps, **always use a custom bridge** or **Docker Compose network**.

---

### ✅ Summary Table

| Network Type       | Created By          | Container Name Resolution | Typical Use                           |
| ------------------ | ------------------- | ------------------------- | ------------------------------------- |
| `bridge` (default) | Docker (by default) | ❌ No                      | Simple, standalone containers         |
| Custom bridge      | User                | ✅ Yes                     | Multi-container local apps            |
| `host`             | Docker              | N/A                       | High performance, shares host network |
| `none`             | Docker              | N/A                       | Isolated container (no network)       |

