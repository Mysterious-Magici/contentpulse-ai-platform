require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const contentRoutes = require("./routes/contentRoutes");

const app = express();
connectDB();

app.use(
  cors({
    origin: process.env.CLIENT_URL
      ? [process.env.CLIENT_URL, "http://localhost:5173"]
      : "*",
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "online", project: "ContentPulse AI MERN API" });
});

app.use("/api/content", contentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`ContentPulse AI Server running on port ${PORT}`);
});