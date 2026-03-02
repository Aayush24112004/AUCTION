const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 🔹 REGISTER HOST
exports.registerHost = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Host already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const host = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "host"
    });

    res.status(201).json({ msg: "Host registered successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// 🔹 LOGIN (Host + Team Owner)
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

  const token = jwt.sign(
  {
    id: user._id,
    role: user.role,
    email: user.email   // 🔥 ADD THIS
  },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);

    // 🍪 Send token in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // true in production (HTTPS)
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.json({
      msg: "Login successful",
      token,
      role: user.role,
      name: user.name,
      teamName: user.teamName || null
    });

    req.user = {
      id: user._id,
      role: user.role,
      email: user.email
    };

  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

exports.logoutUser = (req, res) => {
  res.clearCookie("token");
  res.json({ msg: "Logged out successfully" });
};