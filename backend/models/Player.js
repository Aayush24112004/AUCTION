const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  image: String,
  sold: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });


// 🔥 SAME PLAYER NAME NOT ALLOWED FOR SAME HOST
playerSchema.index({ hostId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Player", playerSchema);