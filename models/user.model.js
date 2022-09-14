const mongoose = require("mongoose");
require("../db/conn");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    email_id: {
      type: String,
      require: true,
      unique: true,
    },
    user_name: {
      type: String,
      require: true,
      unique: true,
    },
    password: {
      type: String,
      require: true,
    },
    phone: {
      type: Number,
      require: true,
    },
    gender: {
      type: String,
      require: true,
    },
    
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
