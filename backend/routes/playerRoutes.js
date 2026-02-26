const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const { addPlayer, getPlayers, getPlayersPublic } = require("../controllers/playerController");
const { protect, hostOnly } = require("../middleware/authMiddleware");

router.post("/add", protect, hostOnly, upload.single("image"), addPlayer);

// Host only
router.get("/", protect, hostOnly, getPlayers);

// Public (Viewer)
router.get("/public/:hostId", getPlayersPublic);

module.exports = router;