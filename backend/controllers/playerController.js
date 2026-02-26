const Player = require("../models/Player");

exports.addPlayer = async (req, res) => {
  try {
    const { name, role } = req.body;
    const hostId = req.user.id;

    const player = await Player.create({
      hostId,
      name,
      role,
      image: req.file ? req.file.path : null
    });

    res.json({ msg: "Player added", player });
  } catch (err) {
    console.error(err);
res.status(500).json({ error: err.message });
  }
};

// 🔹 View Players (All / Sold / Unsold)
exports.getPlayers = async (req, res) => {
  try {
    const { status } = req.query;
    const hostId = req.user.id;

    let filter = { hostId };

    if (status === "sold") filter.sold = true;
    if (status === "unsold") filter.sold = false;

    const players = await Player.find(filter);
    res.json(players);
  } catch (err) {
    console.error(err);
res.status(500).json({ error: err.message });
  }
};

exports.getPlayersPublic = async (req, res) => {
  try {
    const { hostId } = req.params;
    const { status } = req.query;

    let filter = { hostId };

    if (status === "sold") filter.sold = true;
    if (status === "unsold") filter.sold = false;

    const players = await Player.find(filter).select("-hostId");
    res.json(players);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addPlayer = async (req, res) => {
  try {
    const { name, role } = req.body;
    const hostId = req.user.id;

    // 🔥 Check duplicate for same host
    const exists = await Player.findOne({ hostId, name });

    if (exists) {
      return res.status(400).json({
        msg: "Player with this name already exists for this host"
      });
    }

    const player = await Player.create({
      hostId,
      name,
      role,
      image: req.file ? req.file.path : null
    });

    res.json({ msg: "Player added", player });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};