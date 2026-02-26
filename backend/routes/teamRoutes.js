const express = require("express");
const router = express.Router();

const { protect, teamOwnerOnly } = require("../middleware/authMiddleware");
const { getMyTeam } = require("../controllers/teamController");



router.get("/me", protect, teamOwnerOnly, getMyTeam);

module.exports = router;