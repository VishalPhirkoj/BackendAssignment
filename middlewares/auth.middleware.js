const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../models/user.model");
const postUploadPath = path.join(__dirname, "../img/post");
dotenv.config("../.env");

const authorization = (req, res, next) => {
  let token = req.headers.authorization;
  if (token === undefined) {
    res.json({ message: "Please login again Token is Expired" });
    return;
  } else {
    token = token.split("Bearer ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_kEY, (err, payload) => {
      if (err) {
        return res.status(403).json({ message: "User is not authenticated." });
      } else {
        req.user = payload;
        next();
      }
    });
  }
};

const postStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    let token = req.headers.authorization;
    token = token.split("Bearer ")[1];
    let decoded = jwt.decode(token);
    const getId = await User.findOne({ _id: decoded.id }).select("_id");
    console.log(getId);
    let postPath = `${postUploadPath}/${getId._id}`;
    fs.mkdirSync(postPath, { recursive: true });
    cb(null, postPath);
  },
  filename: (req, file, cb) => {
    let extension = path.extname(file.originalname);
    cb(null, Date.now() + extension);
  },
});

const uploadPost = multer({
  storage: postStorage,
  fileFilter: function (req, file, cb) {
    if (file === undefined) {
      cb(null, false);
    } else {
      let extension = path.extname(file.originalname);
      if (
        extension !== ".png" &&
        extension !== ".jpg" &&
        extension !== ".jpeg" &&
        extension !== ".mp4" &&
        extension !== ".mov" &&
        extension !== ".mkv"
      ) {
        cb(null, false);
        return cb(new Error("Only images and videos are allowed"));
      }
      cb(null, true);
    }
  },
});

module.exports = { authorization, uploadPost };
