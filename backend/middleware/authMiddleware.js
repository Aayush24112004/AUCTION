const jwt = require("jsonwebtoken");

// 🔹 Verify token
exports.protect = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ msg: "Not authorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid token" });
  }
};

// 🔹 Only team owner allowed
exports.teamOwnerOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "teamowner") {
    return res.status(403).json({ msg: "Team owner only" });
  }
  next();
};

exports.hostOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "host") {
    return res.status(403).json({ msg: "Host access only" });
  }

  next();
};

exports.teamOwnerOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "teamowner") {
    return res.status(403).json({ msg: "Team owner access only" });
  }
  next();
};

exports.hostOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "host") {
    return res.status(403).json({ msg: "Host access only" });
  }
  next();
};