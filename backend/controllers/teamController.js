const Team = require("../models/Team");
const Player = require("../models/Player");
const auctionState = require("../utils/auctionState");


/* =====================================================
   🔹 TEAM OWNER — DASHBOARD (My Team)
   ===================================================== */
exports.getMyTeam = async (req, res) => {
  try {

    const user = req.user;

    // 🔐 Only team owners allowed
    if (!user || user.role !== "teamowner") {
      return res.status(403).json({ msg: "Team owner access only" });
    }

    // 🧠 Email required to extract loginId
    if (!user.email) {
      return res.status(400).json({ msg: "User email missing in token" });
    }

    const loginId = user.email.split("@")[0];

    // 🔥 Get team + squad players
    const team = await Team.findOne({ loginId })
      .populate("players");   // VERY IMPORTANT

    if (!team) {
      return res.status(404).json({ msg: "Team not found" });
    }

    res.json(team);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};



/* =====================================================
   🔹 HOST — MARK PLAYER SOLD
   ===================================================== */
exports.markSold = async (req, res) => {
  try {
    const hostId = req.user.id;

    // 🔥 Get auction state for this host
    const auction = auctionState.getAuction(hostId);

    if (!auction.currentPlayer) {
      return res.status(400).json({ msg: "No active player" });
    }

    const teamName = auction.highestBidder;
    const amount = auction.highestBid;

    if (!teamName || amount <= 0) {
      return res.status(400).json({ msg: "No valid bids placed" });
    }

    // 🔍 Find winning team
    const team = await Team.findOne({ teamName });

    if (!team) {
      return res.status(404).json({ msg: "Winning team not found" });
    }

    // 💰 Check purse
    if (team.purseRemaining < amount) {
      return res.status(400).json({ msg: "Insufficient purse" });
    }

    // 🔥 Update player document
    const player = await Player.findByIdAndUpdate(
      auction.currentPlayer._id,
      {
        sold: true,
        soldPrice: amount,
        soldTo: team.teamName
      },
      { new: true }
    );

    // 🔥 Add player to team squad
    team.players.push(player._id);

    // 🔥 Deduct purse
    team.purseRemaining -= amount;

    await team.save();

    // 🔥 End auction state for this host
    auctionState.endAuction(hostId);

    res.json({
      msg: "Player sold successfully",
      player,
      team
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};