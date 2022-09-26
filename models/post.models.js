const mongoose = require("mongoose");
require("../db/conn");
const { ObjectId } = mongoose.Schema.Types;

const postSchema = mongoose.Schema(
  {
    text: {
      type: String,
    },
    post: { data: Buffer, contentType: String },
    user: { type: ObjectId, ref: "User", require: true },
    privacypost: { type: String, default: "public" },
    like: [{ type: ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
