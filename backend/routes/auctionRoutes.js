const express = require("express");
const router = express.Router();
const { nextPlayer, markSold, markUnsold, getAuctionStatus } = require("../controllers/auctionController");


const { protect, hostOnly } = require("../middleware/authMiddleware");
const {
  startAuction,
  endAuction,
  getLiveAuctions
} = require("../controllers/auctionController");

router.post("/next-player", protect, hostOnly, nextPlayer);
router.post("/sold", protect, hostOnly, markSold);
router.post("/unsold", protect, hostOnly, markUnsold);
router.get("/status", protect, getAuctionStatus);
router.post("/start", protect, hostOnly, startAuction);
router.post("/end", protect, hostOnly, endAuction);
router.get("/live", getLiveAuctions);
module.exports = router;