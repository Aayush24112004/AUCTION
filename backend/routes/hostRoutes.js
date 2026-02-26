const express = require("express");
const router = express.Router();
const { addTeam, getAllTeams } = require("../controllers/hostController");
const { protect, hostOnly } = require("../middleware/authMiddleware");

router.post("/add-team", protect, hostOnly, addTeam);
router.get("/teams", protect, hostOnly, getAllTeams); 


module.exports = router;