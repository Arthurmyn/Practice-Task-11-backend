require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

/* ---------- Schema & Model ---------- */
const ItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Item = mongoose.model("Item", ItemSchema);

/* ---------- Routes ---------- */
app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

app.get("/api/items", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/items/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/items", async (req, res) => {
  try {
    const item = new Item(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/api/items/:id", async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/items/:id", async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ---------- Start server AFTER MongoDB ---------- */
const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });