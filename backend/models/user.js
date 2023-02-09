const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
  mail: { type: String, unique: true },
  username: { type: String },
  password: { type: String },
  friends: [{ type: Schema.Types.Object, ref: "User" }], // contains ids of user
});

module.exports = mongoose.model("User", userSchema);
