const Team = require("../models/Team");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// 🔹 Generate random string
const generateRandom = (length = 6) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

// 🔹 Add Team (Host only)
exports.addTeam = async (req, res) => {
  try {
    const { teamName, ownerName } = req.body;
    const hostId = req.user.id; // host from JWT

    const existingTeam = await Team.findOne({
  teamName,
  hostId: req.user.id
});

if (existingTeam)
  return res.status(400).json({ msg: "Team already exists for this host" });

    const loginId = generateRandom(8);
    const rawPassword = generateRandom(8);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Create team
const team = await Team.create({
  hostId: req.user.id,
  teamName,
  ownerName,
  loginId,
  password: hashedPassword,
  plainPassword: rawPassword
});

    // Create team owner user for login
await User.create({
  name: ownerName,
  email: loginId + "@team.com",
  password: hashedPassword,
  role: "teamowner",
  teamName,
  teamId: team._id   // ⭐ ADD THIS
});

    res.status(201).json({
      msg: "Team added successfully",
      teamName,
      ownerName,
      loginId,
      password: rawPassword // shown only once here
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// 🔹 View All Teams (Host only)
exports.getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find({ hostId: req.user.id });
    res.json(teams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};