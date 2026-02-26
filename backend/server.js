const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const teamRoutes = require("./routes/teamRoutes");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const hostRoutes = require("./routes/hostRoutes");
const playerRoutes = require("./routes/playerRoutes");
const auctionRoutes = require("./routes/auctionRoutes");

const http = require("http");
const { Server } = require("socket.io");

const auctionState = require("./utils/auctionState");
const Team = require("./models/Team");

const app = express();

// Connect DB
connectDB();

// 🔹 Middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// 🔹 Routes
app.use("/api/auth", authRoutes);
app.use("/api/host", hostRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/auction", auctionRoutes);
app.use("/api/team", teamRoutes);
// Static folder
app.use("/uploads", express.static("uploads"));

// Test route
app.get("/", (req, res) => {
  res.send("Auction API Running...");
});

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true
  }
});

// Make io accessible in controllers
app.set("io", io);

// ================= SOCKET LOGIC =================
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // 🔹 Join auction room using JWT
  socket.on("joinAuction", ({ token }) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const hostId = decoded.id;

      socket.join(hostId);         // Join specific host auction room
      socket.hostId = hostId;      // Save hostId in socket session

      console.log(`Socket ${socket.id} joined auction room ${hostId}`);
    } catch (err) {
      console.log("Invalid token for socket connection");
    }
  });

  // 🔹 Send current auction state
  socket.on("getCurrentAuction", () => {
    if (!socket.hostId) return;
    socket.emit("auctionState", auctionState.getAuction(socket.hostId));
  });

  // 🔹 Team places a bid
  socket.on("placeBid", async ({ teamName, amount }) => {
    try {
      if (!socket.hostId) return;

      const { currentPlayer, highestBid } = auctionState.getAuction(socket.hostId);
      if (!currentPlayer) return;

      const team = await Team.findOne({ teamName, hostId: socket.hostId });
      if (!team) return;

      if (amount <= highestBid) return;
      if (team.purseRemaining < amount) return;

      auctionState.updateBid(socket.hostId, amount, teamName);

      io.to(socket.hostId).emit("bidUpdate", {
        teamName,
        amount
      });

    } catch (err) {
      console.error(err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
// =================================================

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
