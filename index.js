// Import dependencies
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB URI & Client
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Database variables
let bookingCollection;

// Connect to MongoDB
async function connectDB() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");
    const db = client.db("bookingDB"); // Database name
    bookingCollection = db.collection("bookings"); // Collection name
  } catch (err) {
    console.error(" MongoDB Connection Failed:", err);
  }
}
connectDB();

// Routes

// Home route
app.get("/", (req, res) => {
  res.send(" Booking API is running...");
});

// Create booking (POST)
app.post("/api/bookings", async (req, res) => {
  try {
    const booking = req.body;
    booking.createdAt = new Date(); // Add timestamp
    const result = await bookingCollection.insertOne(booking);
    res.status(201).json({ success: true, message: "Booking created", data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to create booking", error: err });
  }
});

// Get all bookings (GET)
app.get("/api/bookings", async (req, res) => {
  try {
    const bookings = await bookingCollection.find().sort({ createdAt: -1 }).toArray();
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch bookings", error: err });
  }
});

// Get booking by ID (GET)
app.get("/api/bookings/:id", async (req, res) => {
  try {
    const { ObjectId } = require("mongodb");
    const booking = await bookingCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch booking", error: err });
  }
});

// Delete booking by ID (DELETE)
app.delete("/api/bookings/:id", async (req, res) => {
  try {
    const { ObjectId } = require("mongodb");
    const result = await bookingCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    res.json({ success: true, message: "Booking deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete booking", error: err });
  }
});

// Server listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

