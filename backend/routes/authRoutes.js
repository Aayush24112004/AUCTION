const express = require("express");
const router = express.Router();
const { registerHost, loginUser, logoutUser } = require("../controllers/authController");

router.post("/logout", logoutUser);
router.post("/register-host", registerHost);
router.post("/login", loginUser);

module.exports = router;