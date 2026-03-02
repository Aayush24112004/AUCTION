const auctionState = require("../utils/auctionState");
const Player = require("../models/Player");
const Team = require("../models/Team");

/* =========================================================
   🔥 START AUCTION (Host only)
========================================================= */
exports.startAuction = async (req, res) => {
  try {
    const hostId = req.user.id;

    const unsoldPlayers = await Player.find({
      hostId,
      sold: false
    });

    if (unsoldPlayers.length === 0) {
      return res.status(400).json({ msg: "No unsold players left" });
    }

    const randomPlayer =
      unsoldPlayers[Math.floor(Math.random() * unsoldPlayers.length)];

    auctionState.setCurrentPlayer(hostId, randomPlayer);

    const io = req.app.get("io");
    io.to(hostId).emit("auctionStarted", randomPlayer);

    res.json({
      msg: "Auction started",
      player: randomPlayer
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

/* =========================================================
   🔥 NEXT PLAYER
========================================================= */
exports.nextPlayer = async (req, res) => {
  try {
    const hostId = req.user.id;

    const shownPlayers = auctionState.getShownPlayers(hostId);

    const player = await Player.findOne({
      hostId,
      sold: false,
      _id: { $nin: [...shownPlayers] }
    });

    if (!player) {
      return res.json({ msg: "All players shown once" });
    }

    auctionState.setCurrentPlayer(hostId, player);

    const io = req.app.get("io");
    io.to(hostId).emit("newPlayer", player);

    res.json({ player });

  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

/* =========================================================
   🔥 MARK SOLD
========================================================= */
exports.markSold = async (req, res) => {
  try {
    const hostId = req.user.id;

    const auction = auctionState.getAuction(hostId);

    if (!auction.currentPlayer) {
      return res.status(400).json({ msg: "No active player" });
    }

    const teamName = auction.highestBidder;
    const amount = auction.highestBid;

    const team = await Team.findOne({ teamName });

    if (!team) {
      return res.status(404).json({ msg: "Winning team not found" });
    }

    // 🔥 Update player
    const player = await Player.findByIdAndUpdate(
      auction.currentPlayer._id,
      {
        sold: true,
        soldPrice: amount,
        soldTo: team.teamName
      },
      { new: true }
    );

    // 🔥 Update team squad
    team.players.push(player._id);
    team.purseRemaining -= amount;

    await team.save();

    auctionState.endAuction(hostId);

    res.json({
      msg: "Player sold",
      player,
      team
    });

  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

/* =========================================================
   🔥 MARK UNSOLD
========================================================= */
exports.markUnsold = async (req, res) => {
  try {
    const hostId = req.user.id;

    const { currentPlayer } = auctionState.getAuction(hostId);

    if (!currentPlayer) {
      return res.status(400).json({ msg: "No active player" });
    }

    const player = await Player.findByIdAndUpdate(
      currentPlayer._id,
      { sold: false },
      { new: true }
    );

    auctionState.clearCurrentPlayer(hostId);

    const io = req.app.get("io");
    io.to(hostId).emit("playerUnsold", player);

    res.json({
      msg: "Player unsold",
      player
    });

  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

/* =========================================================
   🔥 GET CURRENT AUCTION STATUS
========================================================= */
exports.getAuctionStatus = (req, res) => {
  const hostId = req.user.id;

  const { currentPlayer, highestBid, highestBidder, auctionLive } =
    auctionState.getAuction(hostId);

  if (!auctionLive) {
    return res.json({
      live: false,
      message: "Please wait until the auction starts"
    });
  }

  res.json({
    live: true,
    player: currentPlayer,
    highestBid,
    highestBidder
  });
};

/* =========================================================
   🔥 END AUCTION
========================================================= */
exports.endAuction = (req, res) => {
  const hostId = req.user.id;

  auctionState.endAuction(hostId);

  res.json({ msg: "Auction ended" });
};

/* =========================================================
   🔥 GET LIVE AUCTIONS (PUBLIC)
========================================================= */
exports.getLiveAuctions = (req, res) => {
  // Memory-based system → return active hosts
  const auctions = []; // optional implementation

  res.json({
    msg: "Live auctions feature not implemented yet",
    auctions
  });
};

// 🔥 TEAM OWNER PLACES BID
exports.placeBid = async (req, res) => {
  try {
    const hostId = req.body.hostId; // which auction
    const teamId = req.user.id;     // team owner id
    const { amount } = req.body;

    const auction = auctionState.getAuction(hostId);

    if (!auction.currentPlayer) {
      return res.status(400).json({ msg: "No active player" });
    }

    // 🔴 Bid must be higher
    if (amount <= auction.highestBid) {
      return res.status(400).json({ msg: "Bid too low" });
    }

    // 🔍 Get team
    const team = await Team.findOne({ ownerId: teamId });

    if (!team) return res.status(404).json({ msg: "Team not found" });

    if (team.purseRemaining < amount) {
      return res.status(400).json({ msg: "Insufficient purse" });
    }

    // ✅ Update highest bid
    auctionState.updateBid(hostId, amount, team.teamName);

    const io = req.app.get("io");
    io.to(hostId).emit("newBid", {
      team: team.teamName,
      amount
    });

    res.json({ msg: "Bid placed", amount });

  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};