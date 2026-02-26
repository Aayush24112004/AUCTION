const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: function () {
      return this.role === "host";
    },
    unique: true,
    sparse: true
  },
  password: {
    type: String,
    required: function () {
      return this.role !== "viewer";
    }
  },
  role: {
    type: String,
    enum: ["host", "teamowner", "viewer"],
    required: true
  },

teamId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Team"
},

  teamName: {
    type: String // Only for team owners
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);