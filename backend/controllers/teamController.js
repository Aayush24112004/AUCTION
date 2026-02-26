const Team = require("../models/Team");

// 🔹 Get team of logged-in team owner
exports.getMyTeam = async (req, res) => {
  try {
    const team = await Team.findOne({
      teamName: req.user.teamName
    });

    if (!team) {
      return res.status(404).json({ msg: "Team not found" });
    }

    res.json(team);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};