require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

mongoose.set("strictQuery", true);

const ItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, },
    price: { type: Number, required: true, min: 0, },
  },
  { timestamps: true }
);

const Item = mongoose.model("Item", ItemSchema);

const authMiddleware = (req, res, next) => {
  const token = req.headers["x-api-key"];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (token !== "secret") {
    return res.status(403).json({ error: "Forbidden" });
  }

  next();
};

app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

app.get("/version", (req, res) => {
  res.json({
    version: "1.1",
    updatedAt: "2026-01-18",
  });
});

app.get("/api/items", async (req, res) => {
  try {
    const items = await Item.find();
    res.status(200).json(items);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/items/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json(item);
  } catch {
    res.status(400).json({ error: "Invalid ID" });
  }
});

app.post("/api/items", authMiddleware, async (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ error: "Name and price are required" });
    }
    const item = await Item.create({ name, price });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/api/items/:id", authMiddleware, async (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { name, price },
      { new: true, runValidators: true }
    );
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json(item);
  } catch {
    res.status(400).json({ error: "Invalid ID" });
  }
});

app.patch("/api/items/:id", authMiddleware, async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json(item);
  } catch {
    res.status(400).json({ error: "Invalid ID" });
  }
});

app.delete("/api/items/:id", authMiddleware, async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(204).end();
  } catch {
    res.status(400).json({ error: "Invalid ID" });
  }
});

const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(() => {
    process.exit(1);
  });