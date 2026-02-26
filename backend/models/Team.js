const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    teamName: {
      type: String,
      required: true
    },

    ownerName: {
      type: String,
      required: true
    },

    loginId: {
      type: String,
      required: true,
      unique: true
    },

    password: String,
    plainPassword: String,

    purseRemaining: {
      type: Number,
      default: 1000000
    },

    // 🔥 ADD THIS FIELD
    players: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player"
      }
    ]
  },
  { timestamps: true }
);

// 🔥 Team name unique per host
teamSchema.index({ hostId: 1, teamName: 1 }, { unique: true });

module.exports = mongoose.model("Team", teamSchema);